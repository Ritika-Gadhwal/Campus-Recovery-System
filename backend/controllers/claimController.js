const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, getNewClaimEmail, getClaimStatusEmail } = require('../utils/nodemailer');

// Helper to trigger socket.io notification
const sendSocketNotification = (req, recipientId, notification) => {
  const io = req.app.get('io');
  if (io) {
    io.to(recipientId.toString()).emit('new_notification', notification);
    console.log(`Socket notification emitted to room: ${recipientId}`);
  }
};

// @desc    Claim a found item (submitting answer to security question)
// @route   POST /api/claims
// @access  Private
exports.createClaim = async (req, res) => {
  try {
    const { itemId, answer } = req.body;

    const item = await Item.findById(itemId).populate('postedBy', 'name email');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.status === 'Claimed' || item.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Item is already claimed or resolved' });
    }

    if (item.postedBy._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({ itemId, claimantId: req.user.id });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You have already submitted a claim for this item' });
    }

    // Create Claim
    const claim = await Claim.create({
      itemId,
      claimantId: req.user.id,
      answer
    });

    // Populate claimant info for notification usage
    const claimant = await User.findById(req.user.id);

    // Create In-App Notification for item founder
    const notification = await Notification.create({
      recipient: item.postedBy._id,
      sender: req.user.id,
      type: 'new_claim',
      item: item._id,
      message: `${claimant.name} has claimed your item "${item.title}". Check their answer to your security question.`
    });

    // Populate notification details to emit
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name')
      .populate('item', 'title imageUrl');

    // Trigger Real-Time WebSocket Notification
    sendSocketNotification(req, item.postedBy._id, populatedNotification);

    // Send Email to the Founder (using non-blocking async call)
    const emailData = getNewClaimEmail(
      item.postedBy.name,
      claimant.name,
      item.title,
      answer
    );
    sendEmail({
      to: item.postedBy.email,
      subject: emailData.subject,
      html: emailData.html
    }).catch(err => console.error('Failed to send claim email:', err));

    res.status(201).json({
      success: true,
      data: claim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get claims submitted by the current user
// @route   GET /api/claims/my/requests
// @access  Private
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user.id })
      .populate({
        path: 'itemId',
        populate: { path: 'postedBy', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get claims submitted on current user's posted items
// @route   GET /api/claims/incoming
// @access  Private
exports.getIncomingClaims = async (req, res) => {
  try {
    // 1. Find all items posted by the user
    const items = await Item.find({ postedBy: req.user.id });
    const itemIds = items.map(item => item._id);

    // 2. Find claims for those items
    const claims = await Claim.find({ itemId: { $in: itemIds } })
      .populate('itemId', 'title category itemType imageUrl location status')
      .populate('claimantId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject a claim
// @route   PUT /api/claims/:id/status
// @access  Private
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid claim status. Must be Approved or Rejected' });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId', 'name email');

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    // Check if the current user is the owner of the item
    if (claim.itemId.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to manage claims for this item' });
    }

    if (claim.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Claim is already ${claim.status}` });
    }

    // Update claim status
    claim.status = status;
    await claim.save();

    const item = await Item.findById(claim.itemId._id);
    const founder = await User.findById(req.user.id);

    if (status === 'Approved') {
      // Update the item status to 'Claimed'
      item.status = 'Claimed';
      await item.save();

      // Automatically reject all other pending claims for this item
      const otherClaims = await Claim.find({
        itemId: item._id,
        _id: { $ne: claim._id },
        status: 'Pending'
      }).populate('claimantId', 'name email');

      for (let otherClaim of otherClaims) {
        otherClaim.status = 'Rejected';
        await otherClaim.save();

        // Create database notifications for rejected claimants
        const rejectNotification = await Notification.create({
          recipient: otherClaim.claimantId._id,
          sender: req.user.id,
          type: 'claim_rejected',
          item: item._id,
          message: `Your claim request for "${item.title}" was rejected as the item has been claimed by another user.`
        });

        const popRejectNotif = await Notification.findById(rejectNotification._id)
          .populate('sender', 'name')
          .populate('item', 'title imageUrl');

        // Emit Socket Event
        sendSocketNotification(req, otherClaim.claimantId._id, popRejectNotif);

        // Send Email to rejected claimants
        const rejectEmailData = getClaimStatusEmail(
          otherClaim.claimantId.name,
          item.title,
          'Rejected',
          founder.name
        );
        sendEmail({
          to: otherClaim.claimantId.email,
          subject: rejectEmailData.subject,
          html: rejectEmailData.html
        }).catch(err => console.error('Failed to send reject email:', err));
      }
    }

    // Create database notification for this claimant
    const notificationType = status === 'Approved' ? 'claim_approved' : 'claim_rejected';
    const messageText = status === 'Approved'
      ? `Your claim request for "${item.title}" was approved by ${founder.name}! Please get in touch.`
      : `Your claim request for "${item.title}" was rejected by ${founder.name}.`;

    const claimantNotification = await Notification.create({
      recipient: claim.claimantId._id,
      sender: req.user.id,
      type: notificationType,
      item: item._id,
      message: messageText
    });

    const popClaimantNotif = await Notification.findById(claimantNotification._id)
      .populate('sender', 'name')
      .populate('item', 'title imageUrl');

    // Emit Socket Event to claimant
    sendSocketNotification(req, claim.claimantId._id, popClaimantNotif);

    // Send Email to claimant
    const claimEmailData = getClaimStatusEmail(
      claim.claimantId.name,
      item.title,
      status,
      founder.name
    );
    sendEmail({
      to: claim.claimantId.email,
      subject: claimEmailData.subject,
      html: claimEmailData.html
    }).catch(err => console.error('Failed to send claim status email:', err));

    res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
