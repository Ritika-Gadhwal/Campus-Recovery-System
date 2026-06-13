const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Electronics',
      'Books',
      'Documents',
      'Wallets',
      'Keys',
      'Accessories',
      'Others'
    ]
  },
  itemType: {
    type: String,
    required: [true, 'Please specify if the item is Lost or Found'],
    enum: ['Lost', 'Found']
  },
  location: {
    type: String,
    required: [true, 'Please add a location (where it was lost/found)'],
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Please specify the date']
  },
  securityQuestion: {
    type: String,
    trim: true,
    default: '' // Recommended for Found items to verify claim
  },
  status: {
    type: String,
    required: true,
    enum: ['Lost', 'Found', 'Claimed', 'Resolved'],
    default: function() {
      return this.itemType === 'Lost' ? 'Lost' : 'Found';
    }
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index title and description for search query optimization
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
