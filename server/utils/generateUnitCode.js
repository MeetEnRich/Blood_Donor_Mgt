const BloodUnit = require('../models/BloodUnit');

/**
 * Generate a unique blood unit code in the format BU-YYYY-NNNNN
 * Queries the database for the latest code in the current year and increments.
 * @returns {Promise<string>} Generated unit code
 */
const generateUnitCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `BU-${year}-`;

  // Find the latest unit code for the current year
  const latestUnit = await BloodUnit.findOne({
    unitCode: { $regex: `^${prefix}` }
  })
    .sort({ unitCode: -1 })
    .select('unitCode')
    .lean();

  let nextNumber = 1;
  if (latestUnit && latestUnit.unitCode) {
    const currentNumber = parseInt(latestUnit.unitCode.split('-')[2], 10);
    nextNumber = currentNumber + 1;
  }

  const code = `${prefix}${String(nextNumber).padStart(5, '0')}`;
  return code;
};

module.exports = { generateUnitCode };
