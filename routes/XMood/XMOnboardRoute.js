const express = require('express');
const XMOnboard = require('../../models/XMood/XMOnboardSchema');  // Import the model

// Create an Express application
const router = express.Router();


// POST endpoint to add new data
router.post('/XMOnboard', async (req, res) => {
  const { title, sub_title, image } = req.body;

  // Validate required fields
  if (!title || !sub_title || !image || !image.url) {
    return res.status(400).json({ error: 'title, sub_title, and image URL are required.' });
  }

  try {
    // Create a new data entry using the model
    const newData = new XMOnboard({
      title,
      sub_title,
      image
    });

    // Save the new data to the database
    await newData.save();

    res.status(201).json({ message: 'Data added successfully', data: newData });
  } catch (error) {
    res.status(500).json({ error: 'Error adding data', details: error });
  }
});

// GET endpoint to retrieve all data
router.get('/XMOnboard', async (req, res) => {
  try {
    const data = await XMOnboard.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving data', details: error });
  }
});

module.exports = router;


