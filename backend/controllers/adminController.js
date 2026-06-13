const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Get dashboard metrics & analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalClaims = await Claim.countDocuments();

    // Items breakdown by type
    const lostItemsCount = await Item.countDocuments({ itemType: 'Lost' });
    const foundItemsCount = await Item.countDocuments({ itemType: 'Found' });

    // Items breakdown by status
    const lostStatusCount = await Item.countDocuments({ status: 'Lost' });
    const foundStatusCount = await Item.countDocuments({ status: 'Found' });
    const claimedStatusCount = await Item.countDocuments({ status: 'Claimed' });
    const resolvedStatusCount = await Item.countDocuments({ status: 'Resolved' });

    // Claims breakdown by status
    const pendingClaimsCount = await Claim.countDocuments({ status: 'Pending' });
    const approvedClaimsCount = await Claim.countDocuments({ status: 'Approved' });
    const rejectedClaimsCount = await Claim.countDocuments({ status: 'Rejected' });

    // Category distribution
    const categoryDistribution = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers },
        items: {
          total: totalItems,
          lost: lostItemsCount,
          found: foundItemsCount,
          status: {
            lost: lostStatusCount,
            found: foundStatusCount,
            claimed: claimedStatusCount,
            resolved: resolvedStatusCount
          }
        },
        claims: {
          total: totalClaims,
          pending: pendingClaimsCount,
          approved: approvedClaimsCount,
          rejected: rejectedClaimsCount
        },
        categoryDistribution
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect delete self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    // Delete user posts and claims
    await Item.deleteMany({ postedBy: user._id });
    await Claim.deleteMany({ claimantId: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and their related items/claims deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
