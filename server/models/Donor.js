const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Donor = sequelize.define('Donor', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['Male', 'Female', 'Other']],
    },
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
    },
  },
  genotype: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['AA', 'AS', 'SS', 'AC']],
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lga: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coordinates: {
    type: DataTypes.JSON, // { latitude, longitude }
    allowNull: true,
  },
  fcmToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastDonationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  donationHistory: {
    type: DataTypes.JSON, // array of [{ date, facilityName, units, recordedBy }]
    allowNull: false,
    defaultValue: [],
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Donor.prototype.toObject = function () {
  return this.get({ plain: true });
};

module.exports = Donor;
