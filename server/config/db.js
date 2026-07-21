const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dataDir, 'database.sqlite'),
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database connected successfully.');
    
    // Import models to register them
    const User = require('../models/User');
    const Donor = require('../models/Donor');
    const Hospital = require('../models/Hospital');
    const BloodUnit = require('../models/BloodUnit');
    const Request = require('../models/Request');
    const SurveyResponse = require('../models/SurveyResponse');

    // Setup associations to resolve circular imports
    // User -> Donor (one-to-one)
    User.hasOne(Donor, { foreignKey: 'userId', as: 'donor', onDelete: 'CASCADE' });
    Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User -> Hospital (one-to-one)
    User.hasOne(Hospital, { foreignKey: 'userId', as: 'hospital', onDelete: 'CASCADE' });
    Hospital.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Hospital -> BloodUnit
    Hospital.hasMany(BloodUnit, { foreignKey: 'facilityId', as: 'bloodUnits' });
    BloodUnit.belongsTo(Hospital, { foreignKey: 'facilityId', as: 'hospital' });

    // Donor -> BloodUnit
    Donor.hasMany(BloodUnit, { foreignKey: 'donorId', as: 'bloodUnits' });
    BloodUnit.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

    // Hospital -> Request
    Hospital.hasMany(Request, { foreignKey: 'hospitalId', as: 'requests' });
    Request.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

    // Request -> BloodUnit (reservedForRequestId)
    Request.hasMany(BloodUnit, { foreignKey: 'reservedForRequestId', as: 'reservedBloodUnits' });
    BloodUnit.belongsTo(Request, { foreignKey: 'reservedForRequestId', as: 'reservedRequest' });

    // Sync database
    await sequelize.sync({ force: false });
    console.log('Database synced successfully.');
    return sequelize;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
