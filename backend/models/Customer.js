// File: models/Customer.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Customer schema
const CustomerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true, // Ensure no duplicate phone numbers
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    treezCustomerId: {
      type: String, // For storing the external Treez POS customer ID
      required: false,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zip: { type: String, trim: true },
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order', // Reference to Order model
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Export Customer model
module.exports = mongoose.model('Customer', CustomerSchema);
