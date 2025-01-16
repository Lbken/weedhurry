const mongoose = require('mongoose');

const VendorProductSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
  name: { type: String, required: true }, // Product name
  category: { 
    type: String, 
    required: true, 
    enum: ['Flower', 'Pre-roll', 'Vape', 'Edible', 'Concentrate', 'Tincture', 'Gear'] 
  }, // Product category
  brand: { type: String, required: true }, // Product brand
  description: { type: String }, // Product description
  amounts: [{ type: String }],
  variation: { 
    image: { type: String },
    amount: { type: String },
    strain: { type: String },
    thcContent: { type: Number },
    tags: [{ type: String, enum: ['Staff Pick', 'High THC', 'Low THC' ] }],
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    salePrice: { type: Number, min: [0, 'Price cannot be negative'] },
  },
  status: { type: String, required: true, enum: ['Active', 'Disabled'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VendorProduct', VendorProductSchema);
