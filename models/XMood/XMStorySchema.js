// models/Story.js
const mongoose = require('mongoose');

// Define a Story Schema
const XMStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
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

// Create the Story model
const XMStory = mongoose.model('XMStory', XMStorySchema);

module.exports = XMStory;
