const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  facilityName: {
    type: String,
    required: [true, 'Facility name is required']
  },
  facilityType: {
    type: String,
    enum: ['Hospital', 'Clinic', 'Blood Bank', 'Health Centre']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  lga: {
    type: String
  },
  phone: {
    type: String
  },
  contactPersonName: {
    type: String
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hospital', hospitalSchema);
