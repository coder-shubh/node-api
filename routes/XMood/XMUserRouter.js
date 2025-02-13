const express = require("express");
const XMUser = require("../../models/XMood/XMUserSchema"); // Your XMUser schema
const router = express.Router();

// Helper function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
  return emailRegex.test(email);
};

// POST request to register user and update registration count
router.post("/XMUser", async (req, res) => {
  const { name, email } = req.body;

  // Check if the name and email are provided and valid
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    // Check if the user already exists
    let user = await XMUser.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") }, // Case-insensitive search
    });

    if (user) {
      // If user exists, increment the registration count
      user.registrationCount += 1; // Automatically increment registration count
      await user.save(); // Save the updated user data

      return res.status(200).json({
        message: "User registered again successfully",
        statusCode: res.statusCode,
        user: {
          name: user.name,
          email: user.email,
          registrationCount: user.registrationCount, // Return updated registration count
        },
      });
    } else {
      // If user doesn't exist, create a new user
      user = new XMUser({
        name,
        email,
        registrationCount: 1, // First time registration, set count to 1
      });

      await user.save(); // Save the new user data

      return res.status(201).json({
        message: "User registered successfully",
        statusCode: res.statusCode,
        user: {
          name: user.name,
          email: user.email,
          registrationCount: user.registrationCount, // Return registration count
        },
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({
        message: "Error processing registration",
        statusCode: res.statusCode,
        error: err.message,
      });
  }
});

module.exports = router; // Export the router
