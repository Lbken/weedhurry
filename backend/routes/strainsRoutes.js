// routes/strainsRoutes.js
const express = require('express');
const { getStrains } = require('../controllers/strainsController');
const Strain = require('../models/Strain'); // Add this import
const router = express.Router();

// Get all strains
router.get('/', getStrains);

// Add or update strain
router.post('/', async (req, res) => {
  try {
    const { name, classification } = req.body;

    // Validate required fields
    if (!name || !classification) {
      return res.status(400).json({ 
        error: 'Name and classification are required fields' 
      });
    }

    // Check if classification is valid (using enum from schema)
    if (!['Sativa', 'Indica', 'Hybrid', 'CBD'].includes(classification)) {
      return res.status(400).json({ 
        error: 'Invalid classification. Must be Sativa, Indica, Hybrid, or CBD' 
      });
    }

    // Try to find existing strain
    const existingStrain = await Strain.findOne({ name, classification });

    if (existingStrain) {
      // Update existing strain
      const updatedStrain = await Strain.findOneAndUpdate(
        { name, classification },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      return res.json({
        message: 'Strain updated successfully',
        strain: updatedStrain
      });
    }

    // Create new strain
    const newStrain = new Strain(req.body);
    await newStrain.save();

    res.status(201).json({
      message: 'Strain created successfully',
      strain: newStrain
    });

  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.message 
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'A strain with this name and classification already exists' 
      });
    }

    console.error('Error in strain creation:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;