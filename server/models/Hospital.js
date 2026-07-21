const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Hospital = sequelize.define('Hospital', {
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
  facilityName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  facilityType: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['Hospital', 'Clinic', 'Blood Bank', 'Health Centre']],
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lga: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactPersonName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coordinates: {
    type: DataTypes.JSON, // { latitude, longitude }
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Hospital.prototype.toObject = function () {
  return this.get({ plain: true });
};

module.exports = Hospital;
