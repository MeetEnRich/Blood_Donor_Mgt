const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const { Op } = require('sequelize');

// ABO/Rh compatibility chart — who can DONATE TO a given blood group
const compatibilityMap = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

/**
 * Calculate Euclidean distance between two coordinate points
 */
const euclideanDistance = (lat1, lng1, lat2, lng2) => {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
};

/**
 * Find the nearest eligible donors for a blood request using a greedy algorithm.
 * 
 * 1. Get requesting hospital coordinates
 * 2. Query eligible donors (approved, has FCM token, eligible by 90-day rule)
 * 3. Try exact blood group match first
 * 4. If insufficient, expand to compatible blood groups
 * 5. Sort by Euclidean distance ascending
 * 6. Return top N donors (SOS_DONOR_LIMIT)
 * 
 * @param {Object} request - The blood request document
 * @returns {Promise<Array>} Array of nearest eligible donor documents
 */
const findNearestDonors = async (request) => {
  const limit = parseInt(process.env.SOS_DONOR_LIMIT) || 10;
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // 1. Get the requesting hospital's coordinates
  const hospital = await Hospital.findByPk(request.hospitalId);
  if (!hospital || !hospital.coordinates || !hospital.coordinates.latitude) {
    console.warn('Hospital coordinates not available, returning donors without distance sorting');
  }

  const hospitalLat = hospital?.coordinates?.latitude || 0;
  const hospitalLng = hospital?.coordinates?.longitude || 0;

  // Base eligibility query
  const baseQuery = {};
  
  // In production, enforce FCM tokens and 90-day waiting period
  if (process.env.NODE_ENV === 'production') {
    baseQuery.fcmToken = {
      [Op.and]: [
        { [Op.ne]: null },
        { [Op.ne]: '' }
      ]
    };
    baseQuery[Op.or] = [
      { lastDonationDate: null },
      { lastDonationDate: { [Op.lte]: ninetyDaysAgo } }
    ];
  }

  // Also ensure the donor's User account is approved
  const approvedUsers = await User.findAll({
    where: { role: 'donor', status: 'approved' },
    attributes: ['_id']
  });
  const approvedUserIds = approvedUsers.map(u => u._id);
  baseQuery.userId = { [Op.in]: approvedUserIds };

  // 2. Try exact blood group match first
  const exactQuery = { ...baseQuery, bloodGroup: request.bloodGroup };
  let donors = await Donor.findAll({ where: exactQuery });
  let plainDonors = donors.map(d => d.toObject());

  // 3. If insufficient, expand to compatible groups
  if (plainDonors.length < limit) {
    const compatibleGroups = compatibilityMap[request.bloodGroup] || [request.bloodGroup];
    const expandedQuery = { ...baseQuery, bloodGroup: { [Op.in]: compatibleGroups } };
    const allDonors = await Donor.findAll({ where: expandedQuery });
    plainDonors = allDonors.map(d => d.toObject());
  }

  // 4. Calculate distance and sort
  const donorsWithDistance = plainDonors.map(donor => {
    const donorLat = donor.coordinates?.latitude || 0;
    const donorLng = donor.coordinates?.longitude || 0;
    const distance = euclideanDistance(hospitalLat, hospitalLng, donorLat, donorLng);
    return { ...donor, distance };
  });

  donorsWithDistance.sort((a, b) => a.distance - b.distance);

  // 5. Return top N donors
  return donorsWithDistance.slice(0, limit);
};

module.exports = { findNearestDonors, compatibilityMap };
