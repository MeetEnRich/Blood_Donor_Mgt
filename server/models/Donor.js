const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Gender is required']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required']
  },
  genotype: {
    type: String,
    enum: ['AA', 'AS', 'SS', 'AC']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    type: String
  },
  state: {
    type: String
  },
  lga: {
    type: String
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  fcmToken: {
    type: String
  },
  medicalHistory: {
    type: String
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  donationHistory: [{
    date: Date,
    facilityName: String,
    units: Number,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('Donor', donorSchema);
