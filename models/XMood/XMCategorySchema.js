const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const XMCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,  // Ensures category names are unique
  },
  description: {
    type: String,
    default: '',
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
const XMCategory = mongoose.model('XMCategory', XMCategorySchema);

module.exports = XMCategory;
