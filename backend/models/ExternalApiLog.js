const mongoose = require('mongoose');

const externalApiLogSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'PENDING'
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempted: {
    type: Date
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExternalApiLog', externalApiLogSchema);