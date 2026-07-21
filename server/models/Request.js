const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Request = sequelize.define('Request', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hospitalId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
    },
  },
  unitsRequired: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  urgencyLevel: {
    type: DataTypes.STRING,
    defaultValue: 'Routine',
    validate: {
      isIn: [['Routine', 'Urgent', 'Critical']],
    },
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'submitted',
    validate: {
      isIn: [['submitted', 'fulfilling', 'fulfilled', 'sos_dispatched', 'pending_donation', 'unfulfilled', 'cancelled']],
    },
  },
  reservedUnits: {
    type: DataTypes.JSON, // Array of BloodUnit UUIDs
    defaultValue: [],
  },
  alertedDonors: {
    type: DataTypes.JSON, // Array of Donor UUIDs
    defaultValue: [],
  },
  acceptedDonors: {
    type: DataTypes.JSON, // Array of Donor UUIDs
    defaultValue: [],
  },
  fulfilledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Request.prototype.toObject = function () {
  return this.get({ plain: true });
};

module.exports = Request;
