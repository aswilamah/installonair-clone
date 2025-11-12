const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    enum: ['android', 'ios'],
    required: true
  },
  shareId: {
    type: String,
    required: true,
    unique: true
  },
  bundleId: {
    type: String,
    default: ''
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000)
  },
  downloadCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('App', appSchema);
