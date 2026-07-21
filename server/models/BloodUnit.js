const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BloodUnit = sequelize.define('BloodUnit', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  unitCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
    },
  },
  componentType: {
    type: DataTypes.STRING,
    defaultValue: 'Whole Blood',
    validate: {
      isIn: [['Whole Blood', 'Packed Red Cells', 'Platelets', 'Fresh Frozen Plasma']],
    },
  },
  collectionDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available',
    validate: {
      isIn: [['available', 'reserved', 'delivered', 'expired', 'discarded']],
    },
  },
  donorId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  facilityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reservedForRequestId: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
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

BloodUnit.prototype.toObject = function () {
  return this.get({ plain: true });
};

module.exports = BloodUnit;
