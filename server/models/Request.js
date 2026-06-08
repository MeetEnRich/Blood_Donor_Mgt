const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Units required is required'],
    min: [1, 'At least 1 unit is required']
  },
  urgencyLevel: {
    type: String,
    enum: ['Routine', 'Urgent', 'Critical'],
    default: 'Routine'
  },
  status: {
    type: String,
    enum: ['submitted', 'fulfilling', 'fulfilled', 'sos_dispatched', 'pending_donation', 'unfulfilled', 'cancelled'],
    default: 'submitted'
  },
  reservedUnits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodUnit'
  }],
  alertedDonors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  }],
  acceptedDonors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  }],
  fulfilledAt: {
    type: Date
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
requestSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Request', requestSchema);
