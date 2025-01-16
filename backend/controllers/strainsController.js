// strainsController.js
const Strain = require('../models/Strain');

const getStrains = async (req, res) => {
  try {
    const strains = await Strain.find({}, { name: 1, classification: 1 }).sort({ name: 1 });
    res.status(200).json(strains);
  } catch (error) {
    console.error('Error fetching strains:', error);
    res.status(500).json({ message: 'Error fetching strains.' });
  }
};

module.exports = { getStrains };
