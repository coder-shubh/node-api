const XMPhoto = require("../../models/XMood/XMPhotoSchema");
const XMCategory = require("../../models/XMood/XMCategorySchema");
const express = require("express");
const router = express.Router();

// Create a new photo
router.post("/XMItem", async (req, res) => {
  const { uri, shape, type, categoryId, category } = req.body;

  // Check if the category exists
  const XCategory = await XMCategory.findById(categoryId);
  if (!XCategory) {
    return res.status(400).json({ error: "Category not found" });
  }

  try {
    // Create the new photo and set the categoryId field (not category)
    const newPhoto = new XMPhoto({ uri, shape, type, categoryId, category });
    await newPhoto.save();
    return res.status(201).json(newPhoto);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error creating photo", details: error });
  }
});

// Get all photos
// router.get("/XMItem", async (req, res) => {
//   try {
//     const photos = await XMPhoto.find().populate("categoryId");
//     return res.status(200).json(photos);
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "Error fetching photos", details: error });
//   }
// });
router.get("/XMItem", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  try {
    const photos = await XMPhoto.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("categoryId");

    return res.status(200).json(photos);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching photos", details: error });
  }
});


// Get a single photo by ID
router.get("/XMItem/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const photo = await XMPhoto.findById(id).populate("categoryId");
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }
    return res.status(200).json(photo);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error fetching photo", details: error });
  }
});

// Update a photo by ID
router.put("/XMItem/:id", async (req, res) => {
  const { id } = req.params;
  const { uri, shape, type, categoryId } = req.body;

  // Check if the category exists
  const category = await XMCategory.findById(categoryId);
  if (!category) {
    return res.status(400).json({ error: "Category not found" });
  }

  try {
    const updatedPhoto = await XMPhoto.findByIdAndUpdate(
      id,
      { uri, shape, type, categoryId }, // Ensure you're using categoryId here
      { new: true }
    );

    if (!updatedPhoto) {
      return res.status(404).json({ message: "Photo not found" });
    }
    return res.status(200).json(updatedPhoto);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error updating photo", details: error });
  }
});

// Delete a photo by ID
router.delete("/XMItem/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPhoto = await XMPhoto.findByIdAndDelete(id);
    if (!deletedPhoto) {
      return res.status(404).json({ message: "Photo not found" });
    }
    return res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error deleting photo", details: error });
  }
});

module.exports = router;
