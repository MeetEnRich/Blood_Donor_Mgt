const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SurveyResponse = sequelize.define('SurveyResponse', {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  responses: {
    type: DataTypes.JSON, // array of numbers
    allowNull: false,
  },
  susScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

SurveyResponse.prototype.toObject = function () {
  return this.get({ plain: true });
};

module.exports = SurveyResponse;
