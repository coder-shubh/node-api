const mongoose = require('mongoose');

// Define the schema for storing the URL data
const XMReelSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    default: "Success"
  },
  statusCode: {
    type: Number,
    required: true,
    default: 200
  },
  url: {
    type: String,
    required: true
  }
});

// Create a model from the schema
const XMReel = mongoose.model('XMReel', XMReelSchema);

module.exports = XMReel;
