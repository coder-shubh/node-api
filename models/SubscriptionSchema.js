const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to a User model
    ref: "User", // Reference to the User model
    required: false, // Make it optional for global subscriptions
  },
  plan: {
    type: String,
    required: true,
    enum: ["Weekly", "Monthly"],
  },
  mealType: {
    type: String,
    required: true,
    enum: ["Veg", "Non-Veg"],
  },
  price: {
    type: Number,
    required: true,
  },
  mealCount: {
    type: Number,
    required: true,
  },
  freeDelivery: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose middleware to automatically update 'updatedAt' on update
subscriptionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model based on the schema
const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
