const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema({
  unitCode: {
    type: String,
    unique: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  componentType: {
    type: String,
    enum: ['Whole Blood', 'Packed Red Cells', 'Platelets', 'Fresh Frozen Plasma'],
    default: 'Whole Blood'
  },
  collectionDate: {
    type: Date,
    required: [true, 'Collection date is required']
  },
  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'delivered', 'expired', 'discarded'],
    default: 'available'
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  reservedForRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null
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

// Indexes for efficient querying
bloodUnitSchema.index({ bloodGroup: 1 });
bloodUnitSchema.index({ status: 1 });
bloodUnitSchema.index({ expirationDate: 1 });
bloodUnitSchema.index({ bloodGroup: 1, status: 1, expirationDate: 1 });

// Update updatedAt on save
bloodUnitSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);
