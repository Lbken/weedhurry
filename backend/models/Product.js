const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({
  brand: { type: String, required: true }, 
  category: { type: String, required: true, enum: ['Flower', 'Pre-roll', 'Vape', 'Edible', 'Concentrate', 'Tincture', 'Gear'] }, 
  name: { type: String, required: true }, 
  images: [{ type: String }],
  description: { type: String },
  amount: [{ type: String, required: true } ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', ProductSchema);

