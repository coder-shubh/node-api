const XMCategory = require("../../models/XMood/XMCategorySchema");
const express = require("express");
const router = express.Router();

// Create a new category
router.post("/XMCategory", async (req, res) => {
  const { name, description } = req.body;

  // Check if category already exists
  const existingCategory = await XMCategory.findOne({ name });

  if (existingCategory) {
    return res.status(400).json({ error: "Category already exists" });
  }

  try {
    const newCategory = new XMCategory({ name, description });
    await newCategory.save();
    return res.status(201).json(newCategory);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error creating category", details: error });
  }
});

// Get all categories
router.get("/XMCategory", async (req, res) => {
  try {
    const categories = await XMCategory.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error fetching categories", details: error });
  }
});

// Get a single category by ID
router.get("/XMCategory/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const category = await XMCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json(category);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error fetching category", details: error });
  }
});

// Update a category by ID
router.put("/XMCategory/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await XMCategory.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json(updatedCategory);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error updating category", details: error });
  }
});

// Delete a category by ID
router.delete("/XMCategory/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await XMCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error deleting category", details: error });
  }
});
module.exports = router;
