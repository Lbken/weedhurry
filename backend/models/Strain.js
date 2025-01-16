const mongoose = require('mongoose');

const StrainSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    classification: {
      type: String,
      enum: ['Sativa', 'Indica', 'Hybrid', 'CBD'],
      required: true,
    },
    description: { type: String },
    genetics: { type: [String] },
    effects: { type: [String] },
    terpenes: { type: [String] },
    aroma: { type: [String] },
    dominancyScale: {
      type: Number,
      min: 1, // 1: Strongest Sativa
      max: 5, // 5: Strongest Indica
      default: 3, 
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure strain name + classification remains unique
StrainSchema.index({ name: 1, classification: 1 }, { unique: true });

module.exports = mongoose.model('Strain', StrainSchema);
