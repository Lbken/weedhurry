require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const Strain = require('../models/Strain'); // Adjust path as needed
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Path to the strains.json file
const strainsFilePath = path.join(__dirname, '../scripts/strains.json');

const populateStrains = async () => {
  try {
    // Read strains data from JSON file
    const strainsData = JSON.parse(fs.readFileSync(strainsFilePath, 'utf8'));

    // Iterate and upsert each strain (name + classification unique constraint)
    for (const strain of strainsData) {
      const result = await Strain.updateOne(
        { name: strain.name, classification: strain.classification }, // Match by name and classification
        { $set: strain }, // Update the document with the new data
        { upsert: true } // Insert if it does not exist
      );

      if (result.upserted) {
        console.log(`Inserted new strain: ${strain.name} (${strain.classification})`);
      } else {
        console.log(`Updated existing strain: ${strain.name} (${strain.classification})`);
      }
    }

    console.log('Strains populated successfully!');
  } catch (error) {
    console.error('Error populating strains:', error);
  } finally {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed.');
    });
  }
};

populateStrains();