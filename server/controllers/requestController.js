const Request = require('../models/Request');
const BloodUnit = require('../models/BloodUnit');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const { findNearestDonors } = require('../services/greedyAlgorithm');
const { sendSOSAlert } = require('../services/fcmService');
const { Op } = require('sequelize');

/**
 * Helper to manually populate Request relationships (since arrays are stored as JSON in SQLite)
 */
const populateRequestDetails = async (reqs) => {
  const isArray = Array.isArray(reqs);
  const list = isArray ? reqs : [reqs];

  await Promise.all(list.map(async (r) => {
    // Get plain object
    const plain = r.toObject ? r.toObject() : (r.get ? r.get({ plain: true }) : r);

    // Populate hospital
    if (plain.hospitalId) {
      const hospital = await Hospital.findByPk(plain.hospitalId);
      plain.hospital = hospital ? hospital.toObject() : null;
      plain.hospitalId = plain.hospital; // Frontend expects nested hospital object here
    }

    // Populate reservedUnits
    if (plain.reservedUnits && plain.reservedUnits.length > 0) {
      const units = await BloodUnit.findAll({
        where: { _id: { [Op.in]: plain.reservedUnits } }
      });
      plain.reservedUnits = units.map(u => u.toObject());
    } else {
      plain.reservedUnits = [];
    }

    // Populate alertedDonors
    if (plain.alertedDonors && plain.alertedDonors.length > 0) {
      const donors = await Donor.findAll({
        where: { _id: { [Op.in]: plain.alertedDonors } }
      });
      plain.alertedDonors = donors.map(d => d.toObject());
    } else {
      plain.alertedDonors = [];
    }

    // Populate acceptedDonors
    if (plain.acceptedDonors && plain.acceptedDonors.length > 0) {
      const donors = await Donor.findAll({
        where: { _id: { [Op.in]: plain.acceptedDonors } }
      });
      plain.acceptedDonors = donors.map(d => d.toObject());
    } else {
      plain.acceptedDonors = [];
    }

    Object.assign(r, plain);
  }));

  return reqs;
};

/**
 * Submit a blood request (Hospital only).
 */
const submitRequest = async (req, res) => {
  try {
    const { bloodGroup, unitsRequired, urgencyLevel, notes } = req.body;

    // Find the hospital profile for the current user
    const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    // Create the request
    const request = await Request.create({
      hospitalId: hospital._id,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired),
      urgencyLevel: urgencyLevel || 'Routine',
      notes,
      status: 'submitted',
      reservedUnits: [],
      alertedDonors: [],
      acceptedDonors: []
    });

    // PATH A: Check inventory for available non-expired units
    const now = new Date();
    const availableUnits = await BloodUnit.findAll({
      where: {
        bloodGroup,
        status: 'available',
        expirationDate: { [Op.gt]: now }
      },
      order: [['expirationDate', 'ASC']], // FIFO
      limit: parseInt(unitsRequired)
    });

    if (availableUnits.length >= parseInt(unitsRequired)) {
      // Sufficient inventory — reserve units
      const unitIds = availableUnits.map(u => u._id);

      await BloodUnit.update(
        {
          status: 'reserved',
          reservedForRequestId: request._id,
          updatedAt: new Date()
        },
        {
          where: { _id: { [Op.in]: unitIds } }
        }
      );

      await request.update({
        reservedUnits: unitIds,
        status: 'fulfilled',
        fulfilledAt: new Date()
      });

      // Populate response for frontend compatibility
      const populated = await populateRequestDetails(request);

      return res.status(201).json({
        message: 'Request fulfilled from inventory',
        request: populated,
        fulfillmentMethod: 'inventory',
        unitsReserved: unitIds.length
      });
    }

    // PATH B: Insufficient inventory — trigger SOS
    console.log(`⚠️ Insufficient inventory for ${bloodGroup}. Available: ${availableUnits.length}, Required: ${unitsRequired}. Triggering SOS...`);

    // Reserve whatever is available
    let partialUnitIds = [];
    if (availableUnits.length > 0) {
      partialUnitIds = availableUnits.map(u => u._id);
      await BloodUnit.update(
        {
          status: 'reserved',
          reservedForRequestId: request._id,
          updatedAt: new Date()
        },
        {
          where: { _id: { [Op.in]: partialUnitIds } }
        }
      );
    }

    // Find nearest eligible donors using greedy algorithm
    const nearestDonors = await findNearestDonors(request);

    if (nearestDonors.length > 0) {
      const donorIds = nearestDonors.map(d => d._id);
      const fcmTokens = nearestDonors
        .filter(d => d.fcmToken)
        .map(d => d.fcmToken);

      await request.update({
        reservedUnits: partialUnitIds,
        alertedDonors: donorIds,
        status: 'sos_dispatched'
      });

      // Send SOS alerts
      if (fcmTokens.length > 0) {
        await sendSOSAlert(fcmTokens, {
          requestId: request._id,
          bloodGroup,
          hospitalName: hospital.facilityName,
          urgencyLevel: urgencyLevel || 'Routine'
        });
      }

      const populated = await populateRequestDetails(request);

      return res.status(201).json({
        message: 'Insufficient inventory. SOS alert dispatched to nearby donors.',
        request: populated,
        fulfillmentMethod: 'sos',
        donorsAlerted: nearestDonors.length,
        partialUnitsReserved: availableUnits.length
      });
    }

    // No donors found either
    await request.update({
      reservedUnits: partialUnitIds,
      status: 'unfulfilled'
    });

    const populated = await populateRequestDetails(request);

    return res.status(201).json({
      message: 'Request created but no inventory or eligible donors found.',
      request: populated,
      fulfillmentMethod: 'none'
    });
  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({ message: 'Failed to submit request', error: error.message });
  }
};

/**
 * Get all requests (Admin only).
 */
const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, bloodGroup } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const { rows: requests, count: total } = await Request.findAndCountAll({
      where: filter,
      offset: skip,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    const mapped = requests.map(r => r.toObject());
    await populateRequestDetails(mapped);

    res.json({
      requests: mapped,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

/**
 * Get requests for the current hospital (Hospital only).
 */
const getMyRequests = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { hospitalId: hospital._id };
    if (status) filter.status = status;

    const { rows: requests, count: total } = await Request.findAndCountAll({
      where: filter,
      offset: skip,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    const mapped = requests.map(r => r.toObject());
    await populateRequestDetails(mapped);

    res.json({
      requests: mapped,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

/**
 * Get a request by ID (Admin or owning Hospital).
 */
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const mapped = request.toObject();
    await populateRequestDetails(mapped);

    // If hospital role, verify ownership (use straight string comparison)
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });
      if (!hospital || mapped.hospital._id !== hospital._id) {
        return res.status(403).json({ message: 'Access denied: not your request' });
      }
    }

    res.json({ request: mapped });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch request', error: error.message });
  }
};

/**
 * Cancel a request (Hospital only).
 */
const cancelRequest = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.hospitalId !== hospital._id) {
      return res.status(403).json({ message: 'Access denied: not your request' });
    }

    if (request.status === 'cancelled') {
      return res.status(400).json({ message: 'Request is already cancelled' });
    }

    // Release reserved units
    const reservedUnits = request.reservedUnits || [];
    if (reservedUnits.length > 0) {
      await BloodUnit.update(
        {
          status: 'available',
          reservedForRequestId: null,
          updatedAt: new Date()
        },
        {
          where: { _id: { [Op.in]: reservedUnits } }
        }
      );
    }

    await request.update({ status: 'cancelled' });

    const populated = await populateRequestDetails(request);

    res.json({ message: 'Request cancelled and reserved units released', request: populated });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Failed to cancel request', error: error.message });
  }
};

/**
 * Mark reserved units as delivered (Hospital only).
 */
const markDelivered = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.hospitalId !== hospital._id) {
      return res.status(403).json({ message: 'Access denied: not your request' });
    }

    // Update reserved units to delivered
    const reservedUnits = request.reservedUnits || [];
    if (reservedUnits.length > 0) {
      await BloodUnit.update(
        {
          status: 'delivered',
          updatedAt: new Date()
        },
        {
          where: { _id: { [Op.in]: reservedUnits } }
        }
      );
    }

    await request.update({
      status: 'fulfilled',
      fulfilledAt: new Date()
    });

    const populated = await populateRequestDetails(request);

    res.json({ message: 'Units marked as delivered', request: populated });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ message: 'Failed to mark as delivered', error: error.message });
  }
};

/**
 * Get stats for the logged-in hospital.
 */
const getHospitalStats = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const [activeRequests, fulfilledRequests, availableNetworkUnits] = await Promise.all([
      Request.count({
        where: {
          hospitalId: hospital._id,
          status: { [Op.in]: ['submitted', 'fulfilling', 'sos_dispatched', 'pending_donation'] }
        }
      }),
      Request.count({
        where: {
          hospitalId: hospital._id,
          status: 'fulfilled'
        }
      }),
      BloodUnit.count({
        where: {
          status: 'available',
          expirationDate: { [Op.gt]: new Date() }
        }
      })
    ]);

    res.json({
      activeRequests,
      fulfilledRequests,
      availableNetworkUnits
    });
  } catch (error) {
    console.error('Get hospital stats error:', error);
    res.status(500).json({ message: 'Failed to fetch hospital stats', error: error.message });
  }
};

module.exports = {
  submitRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  cancelRequest,
  markDelivered,
  getHospitalStats
};
