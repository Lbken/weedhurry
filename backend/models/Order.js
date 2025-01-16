const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  orderType: { type: String, required: true, default: 'Delivery', enum: ['Delivery', 'Pickup'] },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    image: { type: String }
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'AWAITING_PROCESSING', 
    enum: ['AWAITING_PROCESSING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] 
  },
  contactInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  vendorDetails: {
    dispensaryName: String,
    storefrontAddress: {
      formatted: String,
      coordinates: [Number]
    },
    logoUrl: String
  },
  payment_method: { type: String, required: true },
  customerNotifications: [{ type: String }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Order', orderSchema);