const Item = require('../models/Item');
const User = require('../models/User');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { getMatchingSuggestions } = require('../utils/aiMatcher');

// Helper to handle file upload to Cloudinary/Local
const handleImageUpload = async (req) => {
  if (!req.file) return '';

  try {
    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'college_lost_found'
      });
      // Delete temporary local file
      fs.unlinkSync(req.file.path);
      return result.secure_url;
    } else {
      // Local fallback url path
      return `/uploads/${req.file.filename}`;
    }
  } catch (error) {
    console.error('Image upload error:', error);
    // Return local fallback on Cloudinary failure
    return `/uploads/${req.file.filename}`;
  }
};

// @desc    Post a new item (Lost/Found)
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res) => {
  try {
    const { title, description, category, itemType, location, date, securityQuestion } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await handleImageUpload(req);
    }

    const item = await Item.create({
      title,
      description,
      category,
      itemType,
      location,
      date,
      securityQuestion: itemType === 'Found' ? securityQuestion : '', // Recommended for found items
      imageUrl,
      postedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all items with search, filter, and pagination
// @route   GET /api/items
// @access  Public
exports.getItems = async (req, res) => {
  try {
    const { search, category, itemType, status, limit = 100, page = 1 } = req.query;

    const query = {};

    // Filter by item type (Lost/Found)
    if (itemType) {
      query.itemType = itemType;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Text search on title, description, and location
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('postedBy', 'name email')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single item details, including suggestions and QR Code
// @route   GET /api/items/:id
// @access  Public
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.id || req.params.id).populate('postedBy', 'name email');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Generate dynamic QR Code Data URL pointing to frontend detail page
    const clientOrigin = req.headers.referer || 'http://localhost:5173';
    const detailUrl = `${clientOrigin.split('/dashboard')[0].split('/items')[0]}/items/${item._id}`;
    
    let qrCode = '';
    try {
      qrCode = await QRCode.toDataURL(detailUrl);
    } catch (err) {
      console.error('QR code generation failed:', err);
    }

    res.status(200).json({
      success: true,
      data: item,
      qrCode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get suggestions for a specific item
// @route   GET /api/items/:id/suggestions
// @access  Public
exports.getItemSuggestions = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Find all items of the opposite type that are NOT resolved or claimed
    const oppositeType = item.itemType === 'Lost' ? 'Found' : 'Lost';
    const pool = await Item.find({
      itemType: oppositeType,
      status: oppositeType // Status starts as 'Lost' or 'Found'
    }).populate('postedBy', 'name email');

    const suggestions = getMatchingSuggestions(item, pool, 30); // 30% threshold

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check ownership or admin
    if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this item' });
    }

    const { title, description, category, location, date, securityQuestion, status } = req.body;

    const updateFields = {
      title,
      description,
      category,
      location,
      date,
      securityQuestion: item.itemType === 'Found' ? securityQuestion : '',
      status
    };

    // If new image is uploaded
    if (req.file) {
      updateFields.imageUrl = await handleImageUpload(req);
    }

    item = await Item.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check ownership or admin
    if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this item' });
    }

    // Delete local image file if present and Cloudinary isn't used
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../public', item.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item post removed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's personal items
// @route   GET /api/items/my/all
// @access  Private
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
