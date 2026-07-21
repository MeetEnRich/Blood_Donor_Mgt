const Donor = require('../models/Donor');
const User = require('../models/User');
const Request = require('../models/Request');
const BloodUnit = require('../models/BloodUnit');
const { isDonorEligible, nextEligibleDate } = require('../utils/eligibilityCheck');
const { Op } = require('sequelize');

/**
 * Get all donors (Admin only).
 * Paginated, filterable by status and bloodGroup.
 */
const getAllDonors = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, bloodGroup } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const includeUser = {
      model: User,
      as: 'user',
      attributes: ['email', 'status'],
      where: { role: 'donor' }
    };
    if (status) {
      includeUser.where.status = status;
    }

    const { rows: donors, count: total } = await Donor.findAndCountAll({
      where: filter,
      include: [includeUser],
      offset: skip,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    // Map user nested properties to match the populated Mongoose structure if needed,
    // though Mongoose populate embeds them in `userId`. Let's map it so `userId` property
    // behaves like populated object for frontend compatibility.
    const mappedDonors = donors.map(d => {
      const plain = d.toObject();
      plain.userId = plain.user; // alias user as userId
      return plain;
    });

    res.json({
      donors: mappedDonors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all donors error:', error);
    res.status(500).json({ message: 'Failed to fetch donors', error: error.message });
  }
};

/**
 * Get donor's own profile (Donor only).
 */
const getMyProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({
      where: { userId: req.user.userId },
      include: [{ model: User, as: 'user', attributes: ['email', 'status', 'role'] }]
    });

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const mapped = donor.toObject();
    mapped.userId = mapped.user;

    res.json({ donor: mapped });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

/**
 * Update donor's own profile (Donor only).
 */
const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 'phone', 'address', 'state', 'lga',
      'coordinates', 'genotype', 'medicalHistory'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const donor = await Donor.findOne({ where: { userId: req.user.userId } });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    await donor.update(updates);

    // Refresh and include User info
    const updatedDonor = await Donor.findOne({
      where: { userId: req.user.userId },
      include: [{ model: User, as: 'user', attributes: ['email', 'status'] }]
    });

    const mapped = updatedDonor.toObject();
    mapped.userId = mapped.user;

    res.json({ message: 'Profile updated successfully', donor: mapped });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

/**
 * Update FCM token (Donor only).
 */
const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const donor = await Donor.findOne({ where: { userId: req.user.userId } });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    await donor.update({ fcmToken });

    res.json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ message: 'Failed to update FCM token', error: error.message });
  }
};

/**
 * Get donor by ID (Admin only).
 */
const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['email', 'status', 'role'] }]
    });

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const mapped = donor.toObject();
    mapped.userId = mapped.user;

    res.json({ donor: mapped });
  } catch (error) {
    console.error('Get donor by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch donor', error: error.message });
  }
};

/**
 * Approve a donor (Admin only).
 * Updates the parent User status to 'approved'.
 */
const approveDonor = async (req, res) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    await User.update({ status: 'approved' }, { where: { _id: donor.userId } });

    res.json({ message: 'Donor approved successfully' });
  } catch (error) {
    console.error('Approve donor error:', error);
    res.status(500).json({ message: 'Failed to approve donor', error: error.message });
  }
};

/**
 * Suspend a donor (Admin only).
 * Updates the parent User status to 'suspended'.
 */
const suspendDonor = async (req, res) => {
  try {
    const donor = await Donor.findByPk(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    await User.update({ status: 'suspended' }, { where: { _id: donor.userId } });

    res.json({ message: 'Donor suspended successfully' });
  } catch (error) {
    console.error('Suspend donor error:', error);
    res.status(500).json({ message: 'Failed to suspend donor', error: error.message });
  }
};

/**
 * Record a donation for a donor (Admin or Hospital).
 * Pushes to donationHistory, updates lastDonationDate,
 * and creates a new BloodUnit in inventory.
 */
const recordDonation = async (req, res) => {
  try {
    const { date, facilityName, units } = req.body;

    const donor = await Donor.findByPk(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const donation = {
      date: new Date(date),
      facilityName,
      units: parseInt(units),
      recordedBy: req.user.userId
    };

    const donationHistory = [...(donor.donationHistory || []), donation];
    await donor.update({
      donationHistory,
      lastDonationDate: new Date(date)
    });

    // Create BloodUnit(s) in inventory for each unit donated
    const Hospital = require('../models/Hospital');
    const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });

    const createdUnits = [];
    for (let i = 0; i < parseInt(units); i++) {
      const collectionDate = new Date(date);
      const expirationDate = new Date(date);
      expirationDate.setDate(expirationDate.getDate() + 42); // 42-day shelf life for whole blood

      const unitCode = `BU-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const bloodUnit = await BloodUnit.create({
        unitCode,
        bloodGroup: donor.bloodGroup,
        componentType: 'Whole Blood',
        collectionDate,
        expirationDate,
        status: 'available',
        donorId: donor._id,
        facilityId: hospital ? hospital._id : null,
        notes: `Donated by ${donor.fullName} at ${facilityName}`
      });
      createdUnits.push(bloodUnit);
    }

    res.json({ message: 'Donation recorded successfully', donor, createdUnits });
  } catch (error) {
    console.error('Record donation error:', error);
    res.status(500).json({ message: 'Failed to record donation', error: error.message });
  }
};

/**
 * Check donor eligibility (Admin or Donor).
 */
const checkEligibility = async (req, res) => {
  try {
    let donor;
    if (req.params.id) {
      donor = await Donor.findByPk(req.params.id);
    } else {
      donor = await Donor.findOne({ where: { userId: req.user.userId } });
    }

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const isEligible = isDonorEligible(donor.lastDonationDate);
    const nextDate = nextEligibleDate(donor.lastDonationDate);

    res.json({
      donorId: donor._id,
      fullName: donor.fullName,
      bloodGroup: donor.bloodGroup,
      lastDonationDate: donor.lastDonationDate,
      isEligible,
      nextEligibleDate: nextDate
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ message: 'Failed to check eligibility', error: error.message });
  }
};

/**
 * Get SOS alerts for the current donor (Donor only).
 * Finds Requests where alertedDonors includes this donor's ID.
 */
const getMyAlerts = async (req, res) => {
  try {
    const donor = await Donor.findOne({ where: { userId: req.user.userId } });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const alerts = await Request.findAll({
      where: {
        alertedDonors: {
          [Op.like]: `%${donor._id}%`
        },
        status: { [Op.in]: ['sos_dispatched', 'pending_donation', 'fulfilled'] }
      },
      include: [{ model: Hospital, as: 'hospital', attributes: ['facilityName', 'address', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });

    const mappedAlerts = alerts.map(a => {
      const plain = a.toObject();
      plain.hospitalId = plain.hospital; // alias hospital to hospitalId
      return plain;
    });

    res.json({ alerts: mappedAlerts });
  } catch (error) {
    console.error('Get my alerts error:', error);
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
};

/**
 * Respond to an SOS alert (Donor only).
 * Accept or decline. If accept, push to acceptedDonors and update status.
 */
const respondToAlert = async (req, res) => {
  try {
    const { requestId, response } = req.body;

    if (!['accept', 'decline'].includes(response)) {
      return res.status(400).json({ message: 'Response must be either accept or decline' });
    }

    const donor = await Donor.findOne({ where: { userId: req.user.userId } });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const request = await Request.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if donor was actually alerted
    const alertedDonors = request.alertedDonors || [];
    if (!alertedDonors.includes(donor._id)) {
      return res.status(403).json({ message: 'You were not alerted for this request' });
    }

    if (response === 'accept') {
      const acceptedDonors = request.acceptedDonors || [];
      if (!acceptedDonors.includes(donor._id)) {
        acceptedDonors.push(donor._id);
      }
      await request.update({
        acceptedDonors,
        status: 'pending_donation'
      });

      res.json({ message: 'You have accepted the SOS alert. Thank you!' });
    } else {
      const updatedAlerted = alertedDonors.filter(id => id !== donor._id);
      await request.update({ alertedDonors: updatedAlerted });
      res.json({ message: 'You have declined the SOS alert.' });
    }
  } catch (error) {
    console.error('Respond to alert error:', error);
    res.status(500).json({ message: 'Failed to respond to alert', error: error.message });
  }
};

module.exports = {
  getAllDonors,
  getMyProfile,
  updateMyProfile,
  updateFCMToken,
  getDonorById,
  approveDonor,
  suspendDonor,
  recordDonation,
  checkEligibility,
  getMyAlerts,
  respondToAlert
};
