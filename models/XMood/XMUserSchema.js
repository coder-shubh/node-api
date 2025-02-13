// models/User.js
const mongoose = require('mongoose');

// Define the user schema
const XMUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => /\S+@\S+\.\S+/.test(v), // Simple email regex validation
      message: 'Please provide a valid email address',
    },
  },
  registrationCount: {
    type: Number,
    default: 0, // Initialize login count to 0
  },
});

// Create the model from the schema
const XMUser = mongoose.model('XMUser', XMUserSchema);

module.exports = XMUser;
