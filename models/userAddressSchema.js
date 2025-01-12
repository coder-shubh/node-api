const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model (optional)
  },
  street: {
    type: String,
    required: true,
    trim: true, // Trims leading and trailing spaces
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  isPrimary: {
    type: Boolean,
    default: false, // Indicates if this is the primary address
  },
  createdAt: {
    type: Date,
    default: Date.now, // Sets the default creation date to the current date and time
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserAddress = mongoose.model("UserAddress", userAddressSchema);

module.exports = UserAddress;
