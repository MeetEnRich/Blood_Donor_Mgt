const Donor = require('../models/Donor');
const User = require('../models/User');
const Request = require('../models/Request');
const { isDonorEligible, nextEligibleDate } = require('../utils/eligibilityCheck');

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

    // If status filter, find matching user IDs first
    let userFilter = { role: 'donor' };
    if (status) userFilter.status = status;

    const matchingUsers = await User.find(userFilter).select('_id').lean();
    const userIds = matchingUsers.map(u => u._id);
    filter.userId = { $in: userIds };

    const donors = await Donor.find(filter)
      .populate('userId', 'email status')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Donor.countDocuments(filter);

    res.json({
      donors,
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
    const donor = await Donor.findOne({ userId: req.user.userId })
      .populate('userId', 'email status role');

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.json({ donor });
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

    const donor = await Donor.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'email status');

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.json({ message: 'Profile updated successfully', donor });
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

    const donor = await Donor.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { fcmToken } },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

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
    const donor = await Donor.findById(req.params.id)
      .populate('userId', 'email status role');

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({ donor });
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
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    await User.findByIdAndUpdate(donor.userId, { status: 'approved' });

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
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    await User.findByIdAndUpdate(donor.userId, { status: 'suspended' });

    res.json({ message: 'Donor suspended successfully' });
  } catch (error) {
    console.error('Suspend donor error:', error);
    res.status(500).json({ message: 'Failed to suspend donor', error: error.message });
  }
};

/**
 * Record a donation for a donor (Admin only).
 * Pushes to donationHistory and updates lastDonationDate.
 */
const recordDonation = async (req, res) => {
  try {
    const { date, facilityName, units } = req.body;

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const donation = {
      date: new Date(date),
      facilityName,
      units: parseInt(units),
      recordedBy: req.user.userId
    };

    donor.donationHistory.push(donation);
    donor.lastDonationDate = new Date(date);
    await donor.save();

    res.json({ message: 'Donation recorded successfully', donor });
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
      donor = await Donor.findById(req.params.id);
    } else {
      donor = await Donor.findOne({ userId: req.user.userId });
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
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const alerts = await Request.find({
      alertedDonors: donor._id,
      status: { $in: ['sos_dispatched', 'pending_donation'] }
    })
      .populate('hospitalId', 'facilityName address phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ alerts });
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

    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if donor was actually alerted
    if (!request.alertedDonors.includes(donor._id)) {
      return res.status(403).json({ message: 'You were not alerted for this request' });
    }

    if (response === 'accept') {
      // Avoid duplicates
      if (!request.acceptedDonors.includes(donor._id)) {
        request.acceptedDonors.push(donor._id);
      }
      request.status = 'pending_donation';
      await request.save();

      res.json({ message: 'You have accepted the SOS alert. Thank you!' });
    } else {
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
