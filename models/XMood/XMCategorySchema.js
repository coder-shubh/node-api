const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const XMCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensures category names are unique
    },
    description: {
      type: String,
      default: "",
    },
    creatorName: {
      type: String,
      required: true, // Assuming this is required, but can be adjusted if needed
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid email address"], // Validates email format
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create a model based on the schema
const XMCategory = mongoose.model("XMCategory", XMCategorySchema);

module.exports = XMCategory;
