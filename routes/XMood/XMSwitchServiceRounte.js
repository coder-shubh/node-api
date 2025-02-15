const express = require("express");
const XMServiceStatusSchema = require("../../models/XMood/XMServiceStatusSchema"); // Import the model
const router = express.Router();

// POST API: Create or update a number
router.post("/XMSwitchService", async (req, res) => {
  const inputNumber = req.body.number;

  // Check if the input is a valid number
  if (typeof inputNumber !== "number") {
    return res.status(400).json({
      status: "error",
      statusCode: res.statusCode,
      error: "Please provide a valid number.",
    });
  }

  try {
    // Check if number exists in DB
    let numberData = await XMServiceStatusSchema.findOne();

    if (numberData) {
      // Update the number if it exists
      numberData.number = inputNumber;
      await numberData.save();
    } else {
      // Create a new entry if the number does not exist
      numberData = new XMServiceStatusSchema({ number: inputNumber });
      await numberData.save();
    }

    res.status(200).json({
      status: "success",
      statusCode: res.statusCode,
      data: inputNumber === 0 ? 0 : 1, // Return 0 or 1 inside the 'data' object
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: res.statusCode,
      error: "Server error. Please try again.",
    });
  }
});

// GET API: Fetch the current number from the database
router.get("/XMSwitchService", async (req, res) => {
  try {
    const numberData = await XMServiceStatusSchema.findOne();
    if (numberData) {
      res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        data: numberData.number,
      });
    } else {
      res.status(404).json({
        status: "error",
        statusCode: res.statusCode,
        error: "No data found.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: res.statusCode,
      error: "Server error. Please try again.",
    });
  }
});

// UPDATE API: Update the number
router.put("/XMSwitchService", async (req, res) => {
  const inputNumber = req.body.number;

  // Validate input number
  if (typeof inputNumber !== "number") {
    return res.status(400).json({
      status: "error",
      statusCode: res.statusCode,
      error: "Please provide a valid number.",
    });
  }

  try {
    let numberData = await XMServiceStatusSchema.findOne();

    if (numberData) {
      // Update the existing record
      numberData.number = inputNumber;
      await numberData.save();

      res.status(200).json({
        status: "success",
        statusCode: res.statusCode,
        data: numberData.number,
      });
    } else {
      // No existing record found
      res.status(404).json({
        status: "error",
        statusCode: res.statusCode,
        error: "No data found to update.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      statusCode: res.statusCode,
      error: "Server error. Please try again.",
    });
  }
});

module.exports = router;
