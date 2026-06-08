const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodUnit = require('../models/BloodUnit');
const Request = require('../models/Request');
const SurveyResponse = require('../models/SurveyResponse');

/**
 * Get dashboard statistics (Admin only).
 */
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalDonors,
      totalHospitals,
      totalBloodUnits,
      availableUnits,
      requestsToday,
      fulfilledToday
    ] = await Promise.all([
      Donor.countDocuments(),
      Hospital.countDocuments(),
      BloodUnit.countDocuments(),
      BloodUnit.countDocuments({ status: 'available' }),
      Request.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Request.countDocuments({
        status: 'fulfilled',
        fulfilledAt: { $gte: today, $lt: tomorrow }
      })
    ]);

    res.json({
      totalDonors,
      totalHospitals,
      totalBloodUnits,
      availableUnits,
      requestsToday,
      fulfilledToday
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

/**
 * Get all hospitals (Admin only).
 */
const getAllHospitals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const hospitals = await Hospital.find()
      .populate('userId', 'email status')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Hospital.countDocuments();

    res.json({
      hospitals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all hospitals error:', error);
    res.status(500).json({ message: 'Failed to fetch hospitals', error: error.message });
  }
};

/**
 * Approve a hospital (Admin only).
 */
const approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    await User.findByIdAndUpdate(hospital.userId, { status: 'approved' });

    res.json({ message: 'Hospital approved successfully' });
  } catch (error) {
    console.error('Approve hospital error:', error);
    res.status(500).json({ message: 'Failed to approve hospital', error: error.message });
  }
};

/**
 * Suspend a hospital (Admin only).
 */
const suspendHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    await User.findByIdAndUpdate(hospital.userId, { status: 'suspended' });

    res.json({ message: 'Hospital suspended successfully' });
  } catch (error) {
    console.error('Suspend hospital error:', error);
    res.status(500).json({ message: 'Failed to suspend hospital', error: error.message });
  }
};

/**
 * Fulfillment report (Admin only).
 * % fulfilled from inventory vs SOS. Monthly breakdown.
 */
const getFulfillmentReport = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01`);

    const requests = await Request.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    }).lean();

    // Overall stats
    const total = requests.length;
    const fulfilled = requests.filter(r => r.status === 'fulfilled');
    const sosDispatched = requests.filter(r =>
      ['sos_dispatched', 'pending_donation'].includes(r.status)
    );
    const inventoryFulfilled = fulfilled.filter(r =>
      r.reservedUnits && r.reservedUnits.length > 0 && r.alertedDonors.length === 0
    );
    const sosFulfilled = fulfilled.filter(r =>
      r.alertedDonors && r.alertedDonors.length > 0
    );

    // Monthly breakdown
    const monthly = {};
    for (let m = 0; m < 12; m++) {
      const monthName = new Date(2026, m).toLocaleString('default', { month: 'short' });
      const monthRequests = requests.filter(r => new Date(r.createdAt).getMonth() === m);
      const monthFulfilled = monthRequests.filter(r => r.status === 'fulfilled');
      monthly[monthName] = {
        total: monthRequests.length,
        fulfilled: monthFulfilled.length,
        fulfillmentRate: monthRequests.length > 0
          ? ((monthFulfilled.length / monthRequests.length) * 100).toFixed(1)
          : '0.0'
      };
    }

    res.json({
      year: parseInt(year),
      overall: {
        totalRequests: total,
        fulfilled: fulfilled.length,
        inventoryFulfilled: inventoryFulfilled.length,
        sosFulfilled: sosFulfilled.length,
        sosDispatched: sosDispatched.length,
        fulfillmentRate: total > 0
          ? ((fulfilled.length / total) * 100).toFixed(1)
          : '0.0'
      },
      monthly
    });
  } catch (error) {
    console.error('Fulfillment report error:', error);
    res.status(500).json({ message: 'Failed to generate fulfillment report', error: error.message });
  }
};

/**
 * Donor activity report (Admin only).
 * Most active donors, dormant donors (180+ days no donation).
 */
const getDonorActivityReport = async (req, res) => {
  try {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    // Most active donors (by donation count)
    const mostActive = await Donor.find({
      'donationHistory.0': { $exists: true }
    })
      .sort({ 'donationHistory': -1 })
      .limit(10)
      .select('fullName bloodGroup donationHistory lastDonationDate')
      .lean();

    // Sort by donation count
    mostActive.sort((a, b) =>
      (b.donationHistory?.length || 0) - (a.donationHistory?.length || 0)
    );

    // Dormant donors (180+ days since last donation or never donated)
    const dormantDonors = await Donor.find({
      $or: [
        { lastDonationDate: { $lte: sixMonthsAgo } },
        { lastDonationDate: null, createdAt: { $lte: sixMonthsAgo } }
      ]
    })
      .select('fullName bloodGroup lastDonationDate phone')
      .lean();

    // Total donation count
    const allDonors = await Donor.find().lean();
    const totalDonations = allDonors.reduce(
      (sum, d) => sum + (d.donationHistory?.length || 0), 0
    );

    res.json({
      totalDonors: allDonors.length,
      totalDonations,
      mostActive: mostActive.map(d => ({
        fullName: d.fullName,
        bloodGroup: d.bloodGroup,
        donationCount: d.donationHistory?.length || 0,
        lastDonation: d.lastDonationDate
      })),
      dormantDonors: {
        count: dormantDonors.length,
        donors: dormantDonors
      }
    });
  } catch (error) {
    console.error('Donor activity report error:', error);
    res.status(500).json({ message: 'Failed to generate donor activity report', error: error.message });
  }
};

/**
 * Inventory report (Admin only).
 * Units added vs used vs expired per month.
 */
const getInventoryReport = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01`);

    const units = await BloodUnit.find({
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    }).lean();

    const monthly = {};
    for (let m = 0; m < 12; m++) {
      const monthName = new Date(2026, m).toLocaleString('default', { month: 'short' });
      const monthUnits = units.filter(u => new Date(u.createdAt).getMonth() === m);

      monthly[monthName] = {
        added: monthUnits.length,
        delivered: monthUnits.filter(u => u.status === 'delivered').length,
        expired: monthUnits.filter(u => u.status === 'expired').length,
        discarded: monthUnits.filter(u => u.status === 'discarded').length,
        available: monthUnits.filter(u => u.status === 'available').length
      };
    }

    // Overall totals
    const overall = {
      total: units.length,
      available: units.filter(u => u.status === 'available').length,
      reserved: units.filter(u => u.status === 'reserved').length,
      delivered: units.filter(u => u.status === 'delivered').length,
      expired: units.filter(u => u.status === 'expired').length,
      discarded: units.filter(u => u.status === 'discarded').length
    };

    res.json({ year: parseInt(year), overall, monthly });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ message: 'Failed to generate inventory report', error: error.message });
  }
};

/**
 * SUS report (Admin only).
 * Average SUS score across all users, broken down by role.
 */
const getSUSReport = async (req, res) => {
  try {
    const allSurveys = await SurveyResponse.find().lean();

    if (allSurveys.length === 0) {
      return res.json({
        totalResponses: 0,
        averageSUSScore: 0,
        byRole: {}
      });
    }

    const overallAvg = allSurveys.reduce((sum, s) => sum + (s.susScore || 0), 0) / allSurveys.length;

    // Breakdown by role
    const roles = ['admin', 'hospital', 'donor'];
    const byRole = {};
    roles.forEach(role => {
      const roleSurveys = allSurveys.filter(s => s.role === role);
      byRole[role] = {
        count: roleSurveys.length,
        averageSUSScore: roleSurveys.length > 0
          ? (roleSurveys.reduce((sum, s) => sum + (s.susScore || 0), 0) / roleSurveys.length).toFixed(1)
          : 0
      };
    });

    res.json({
      totalResponses: allSurveys.length,
      averageSUSScore: overallAvg.toFixed(1),
      byRole
    });
  } catch (error) {
    console.error('SUS report error:', error);
    res.status(500).json({ message: 'Failed to generate SUS report', error: error.message });
  }
};

module.exports = {
  getStats,
  getAllHospitals,
  approveHospital,
  suspendHospital,
  getFulfillmentReport,
  getDonorActivityReport,
  getInventoryReport,
  getSUSReport
};
