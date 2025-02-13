// models/AppOpen.js
const mongoose = require("mongoose");

const XMAppOpen = new mongoose.Schema({
  deviceInfo: {
    type: String,
    required: true,
  },
  deviceVisits: {
    type: Map,
    of: Number,
    default: {},
  },
  totalOpens: {
    type: Number,
    default: 0,
  },
});

const AppOpen = mongoose.model("AppOpen", XMAppOpen);

module.exports = AppOpen;
