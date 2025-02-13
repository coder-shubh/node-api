const express = require("express");
const XMCategory = require("../../models/XMood/XMReelSchema");
const router = express.Router();

// GET route for XMReel
router.get("/XMReel", async (req, res) => {
  try {
    // Find the URL in the database (if it exists)
    let urlDoc = await XMCategory.findOne();

    if (!urlDoc) {
      // If no URL exists in the database, create a default one
      urlDoc = new XMCategory({
        message: "Success",
        statusCode: 200,
        url: "https://www.google.com", // Default URL
      });

      // Save the new URL to the database
      await urlDoc.save();
    }

    // Send the response back with the URL data
    res.status(urlDoc.statusCode).json({
      message: urlDoc.message,
      statusCode: urlDoc.statusCode,
      url: urlDoc.url,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      statusCode: 500,
      error: error.message,
    });
  }
});

module.exports = router;
