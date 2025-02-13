const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const photoSchema = new Schema({
  uri: {
    type: String,
    required: true,  // URL of the image or video
  },
  shape: {
    type: String,
    enum: ['square', 'vertical', 'landscape'],
    default: 'square',  // Default shape is square
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'XMCategory',  // Reference to Category model
    required: true,   // This is required for linking a photo to a category
  },
  category: {
    type: String,  // This is optional but used for faster querying
    required: true,  // Denormalized category name
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
},{ timestamps: true });

// Create a model based on the schema
const XMPhoto = mongoose.model('XMPhoto', photoSchema);

module.exports = XMPhoto;
