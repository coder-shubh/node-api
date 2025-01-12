const mongoose = require("mongoose");
const Category = require("./categorySchema");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
