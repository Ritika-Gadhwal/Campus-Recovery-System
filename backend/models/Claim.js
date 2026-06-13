const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item',
    required: true
  },
  claimantId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer to the security question'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid duplicate claims by the same user on the same item
claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);
