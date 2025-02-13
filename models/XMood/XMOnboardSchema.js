const mongoose = require("mongoose");

// Define the schema for the data
const XMOnboardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sub_title: { type: String, required: true },
  image: {
    url: { type: String, required: true },
  },
});

// Create a model from the schema
const XMOnboard = mongoose.model("XMOnboard", XMOnboardSchema);

// Export the model so it can be used in other files
module.exports = XMOnboard;
