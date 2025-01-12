const mongoose = require("mongoose");
const FoodCategory = require("./foodCategorySchema");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["vegetarian", "non-vegetarian", "vegan", "dessert"],
    required: true,
  },
  foodCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodCategory",
    required: true,
  },
  ingredients: {
    type: [String], // An array of ingredients
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  servings: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  coords: {
    type: [
      {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

module.exports = mongoose.model("Food", foodSchema);
