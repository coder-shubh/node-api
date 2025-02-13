const express = require('express');
const XMStory = require("../../models/XMood/XMStorySchema");

const router = express.Router();


router.get('/XMStory', async (req, res) => {
    try {
      const stories = await XMStory.find(); // Fetch all stories
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve stories' });
    }
  });
  
  // Route to get a specific story by ID
  router.get('/XMStory/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const story = await XMStory.findById(id); // Fetch a specific story by ID
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve story' });
    }
  });
  
  // Route to create a new story
  router.post('/XMStory', async (req, res) => {
    const { title, content, summary, category } = req.body;
  
    try {
      // Create a new story instance
      const newStory = new XMStory({
        title,
        content,
        summary,
        category,
      });
  
      // Save the new story to the database
      await newStory.save();
      res.status(201).json(newStory); // Return the created story
    } catch (error) {
      res.status(400).json({ message: 'Error creating story' });
    }
  });
  
  // Route to update an existing story
  router.put('/XMStory/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, summary, category } = req.body;
  
    try {
      const story = await XMStory.findById(id); // Find the story by ID
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
  
      // Update the story fields
      story.title = title || story.title;
      story.content = content || story.content;
      story.summary = summary || story.summary;
      story.category = category || story.category;
  
      await story.save(); // Save the updated story
      res.json(story); // Return the updated story
    } catch (error) {
      res.status(400).json({ message: 'Error updating story' });
    }
  });
  
  // Route to delete a story
  router.delete('/XMStory/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const story = await XMStory.findByIdAndDelete(id); // Delete the story by ID
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({ message: 'Error deleting story' });
    }
  });
  
  module.exports = router;
