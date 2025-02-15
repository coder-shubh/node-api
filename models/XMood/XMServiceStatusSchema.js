const mongoose = require("mongoose");

// Define a schema for storing number data
const XMServiceStatusSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
});

// Create a model from the schema
const XMServiceStatus = mongoose.model(
  "XMServiceStatus",
  XMServiceStatusSchema
);

module.exports = XMServiceStatus;
