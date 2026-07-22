const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodUnit = require('../models/BloodUnit');
const Request = require('../models/Request');
const SurveyResponse = require('../models/SurveyResponse');
const { Op } = require('sequelize');

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
      Donor.count(),
      Hospital.count(),
      BloodUnit.count(),
      BloodUnit.count({ where: { status: 'available' } }),
      Request.count({
        where: {
          createdAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      }),
      Request.count({
        where: {
          status: 'fulfilled',
          fulfilledAt: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
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

    const { rows: hospitals, count: total } = await Hospital.findAndCountAll({
      include: [{ model: User, as: 'user', attributes: ['email', 'status'] }],
      offset: skip,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    const mappedHospitals = hospitals.map(h => {
      const plain = h.toObject();
      plain.userId = plain.user; // Frontend compatibility for populated userId
      plain.status = plain.user?.status || 'pending';
      return plain;
    });

    res.json({
      hospitals: mappedHospitals,
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
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    await User.update({ status: 'approved' }, { where: { _id: hospital.userId } });

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
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    await User.update({ status: 'suspended' }, { where: { _id: hospital.userId } });

    res.json({ message: 'Hospital suspended successfully' });
  } catch (error) {
    console.error('Suspend hospital error:', error);
    res.status(500).json({ message: 'Failed to suspend hospital', error: error.message });
  }
};

/**
 * Fulfillment report (Admin only).
 */
const getFulfillmentReport = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01`);

    const requests = await Request.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfYear,
          [Op.lt]: endOfYear
        }
      }
    });

    const plainRequests = requests.map(r => r.toObject());

    // Overall stats
    const total = plainRequests.length;
    const fulfilled = plainRequests.filter(r => r.status === 'fulfilled');
    const sosDispatched = plainRequests.filter(r =>
      ['sos_dispatched', 'pending_donation'].includes(r.status)
    );
    const inventoryFulfilled = fulfilled.filter(r =>
      r.reservedUnits && r.reservedUnits.length > 0 && (!r.alertedDonors || r.alertedDonors.length === 0)
    );
    const sosFulfilled = fulfilled.filter(r =>
      r.alertedDonors && r.alertedDonors.length > 0
    );

    // Monthly breakdown
    const monthly = {};
    for (let m = 0; m < 12; m++) {
      const monthName = new Date(2026, m).toLocaleString('default', { month: 'short' });
      const monthRequests = plainRequests.filter(r => new Date(r.createdAt).getMonth() === m);
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
 */
const getDonorActivityReport = async (req, res) => {
  try {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const allDonors = await Donor.findAll();
    const plainDonors = allDonors.map(d => d.toObject());

    // Most active donors (by donation count)
    const mostActive = plainDonors
      .filter(d => d.donationHistory && d.donationHistory.length > 0)
      .sort((a, b) => b.donationHistory.length - a.donationHistory.length)
      .slice(0, 10);

    // Dormant donors (180+ days since last donation or never donated)
    const dormantDonors = await Donor.findAll({
      where: {
        [Op.or]: [
          { lastDonationDate: { [Op.lte]: sixMonthsAgo } },
          {
            lastDonationDate: null,
            createdAt: { [Op.lte]: sixMonthsAgo }
          }
        ]
      }
    });

    const totalDonations = plainDonors.reduce(
      (sum, d) => sum + (d.donationHistory?.length || 0), 0
    );

    res.json({
      totalDonors: plainDonors.length,
      totalDonations,
      mostActive: mostActive.map(d => ({
        fullName: d.fullName,
        bloodGroup: d.bloodGroup,
        donationCount: d.donationHistory?.length || 0,
        lastDonation: d.lastDonationDate
      })),
      dormantDonors: {
        count: dormantDonors.length,
        donors: dormantDonors.map(d => d.toObject())
      }
    });
  } catch (error) {
    console.error('Donor activity report error:', error);
    res.status(500).json({ message: 'Failed to generate donor activity report', error: error.message });
  }
};

/**
 * Inventory report (Admin only).
 */
const getInventoryReport = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01`);

    const units = await BloodUnit.findAll({
      where: {
        createdAt: {
          [Op.gte]: startOfYear,
          [Op.lt]: endOfYear
        }
      }
    });

    const plainUnits = units.map(u => u.toObject());

    const monthly = {};
    for (let m = 0; m < 12; m++) {
      const monthName = new Date(2026, m).toLocaleString('default', { month: 'short' });
      const monthUnits = plainUnits.filter(u => new Date(u.createdAt).getMonth() === m);

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
      total: plainUnits.length,
      available: plainUnits.filter(u => u.status === 'available').length,
      reserved: plainUnits.filter(u => u.status === 'reserved').length,
      delivered: plainUnits.filter(u => u.status === 'delivered').length,
      expired: plainUnits.filter(u => u.status === 'expired').length,
      discarded: plainUnits.filter(u => u.status === 'discarded').length
    };

    res.json({ year: parseInt(year), overall, monthly });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ message: 'Failed to generate inventory report', error: error.message });
  }
};

/**
 * SUS report (Admin only).
 */
const getSUSReport = async (req, res) => {
  try {
    const allSurveys = await SurveyResponse.findAll();
    const plainSurveys = allSurveys.map(s => s.toObject());

    if (plainSurveys.length === 0) {
      return res.json({
        totalResponses: 0,
        averageSUSScore: 0,
        byRole: {}
      });
    }

    const overallAvg = plainSurveys.reduce((sum, s) => sum + (s.susScore || 0), 0) / plainSurveys.length;

    // Breakdown by role
    const roles = ['admin', 'hospital', 'donor'];
    const byRole = {};
    roles.forEach(role => {
      const roleSurveys = plainSurveys.filter(s => s.role === role);
      byRole[role] = {
        count: roleSurveys.length,
        averageSUSScore: roleSurveys.length > 0
          ? (roleSurveys.reduce((sum, s) => sum + (s.susScore || 0), 0) / roleSurveys.length).toFixed(1)
          : 0
      };
    });

    res.json({
      totalResponses: plainSurveys.length,
      averageSUSScore: overallAvg.toFixed(1),
      byRole
    });
  } catch (error) {
    console.error('SUS report error:', error);
    res.status(500).json({ message: 'Failed to generate SUS report', error: error.message });
  }
};

/**
 * Delete a hospital account (Admin only).
 */
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Delete parent User (cascades to Hospital)
    await User.destroy({ where: { _id: hospital.userId } });

    res.json({ message: 'Hospital account deleted successfully' });
  } catch (error) {
    console.error('Delete hospital error:', error);
    res.status(500).json({ message: 'Failed to delete hospital', error: error.message });
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
  getSUSReport,
  deleteHospital
};
