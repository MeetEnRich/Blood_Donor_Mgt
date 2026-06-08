const Request = require('../models/Request');
const BloodUnit = require('../models/BloodUnit');
const Hospital = require('../models/Hospital');
const { findNearestDonors } = require('../services/greedyAlgorithm');
const { sendSOSAlert } = require('../services/fcmService');

/**
 * Submit a blood request (Hospital only).
 * Runs the fulfillment pipeline:
 *   Path A: Sufficient inventory → reserve units → fulfilled
 *   Path B: Insufficient inventory → greedy algorithm → SOS alert → sos_dispatched
 */
const submitRequest = async (req, res) => {
  try {
    const { bloodGroup, unitsRequired, urgencyLevel, notes } = req.body;

    // Find the hospital profile for the current user
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    // Create the request
    const request = new Request({
      hospitalId: hospital._id,
      bloodGroup,
      unitsRequired: parseInt(unitsRequired),
      urgencyLevel: urgencyLevel || 'Routine',
      notes,
      status: 'submitted'
    });
    await request.save();

    // PATH A: Check inventory for available non-expired units
    const now = new Date();
    const availableUnits = await BloodUnit.find({
      bloodGroup,
      status: 'available',
      expirationDate: { $gt: now }
    })
      .sort({ expirationDate: 1 }) // FIFO: use oldest first
      .limit(parseInt(unitsRequired))
      .lean();

    if (availableUnits.length >= parseInt(unitsRequired)) {
      // Sufficient inventory — reserve units
      const unitIds = availableUnits.map(u => u._id);

      await BloodUnit.updateMany(
        { _id: { $in: unitIds } },
        {
          $set: {
            status: 'reserved',
            reservedForRequestId: request._id,
            updatedAt: new Date()
          }
        }
      );

      request.reservedUnits = unitIds;
      request.status = 'fulfilled';
      request.fulfilledAt = new Date();
      await request.save();

      return res.status(201).json({
        message: 'Request fulfilled from inventory',
        request,
        fulfillmentMethod: 'inventory',
        unitsReserved: unitIds.length
      });
    }

    // PATH B: Insufficient inventory — trigger SOS
    console.log(`⚠️ Insufficient inventory for ${bloodGroup}. Available: ${availableUnits.length}, Required: ${unitsRequired}. Triggering SOS...`);

    // Reserve whatever is available
    if (availableUnits.length > 0) {
      const partialUnitIds = availableUnits.map(u => u._id);
      await BloodUnit.updateMany(
        { _id: { $in: partialUnitIds } },
        {
          $set: {
            status: 'reserved',
            reservedForRequestId: request._id,
            updatedAt: new Date()
          }
        }
      );
      request.reservedUnits = partialUnitIds;
    }

    // Find nearest eligible donors using greedy algorithm
    const nearestDonors = await findNearestDonors(request);

    if (nearestDonors.length > 0) {
      // Collect FCM tokens and donor IDs
      const donorIds = nearestDonors.map(d => d._id);
      const fcmTokens = nearestDonors
        .filter(d => d.fcmToken)
        .map(d => d.fcmToken);

      request.alertedDonors = donorIds;
      request.status = 'sos_dispatched';
      await request.save();

      // Send SOS alerts
      if (fcmTokens.length > 0) {
        await sendSOSAlert(fcmTokens, {
          requestId: request._id,
          bloodGroup,
          hospitalName: hospital.facilityName,
          urgencyLevel: urgencyLevel || 'Routine'
        });
      }

      return res.status(201).json({
        message: 'Insufficient inventory. SOS alert dispatched to nearby donors.',
        request,
        fulfillmentMethod: 'sos',
        donorsAlerted: nearestDonors.length,
        partialUnitsReserved: availableUnits.length
      });
    }

    // No donors found either
    request.status = 'unfulfilled';
    await request.save();

    return res.status(201).json({
      message: 'Request created but no inventory or eligible donors found.',
      request,
      fulfillmentMethod: 'none'
    });
  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({ message: 'Failed to submit request', error: error.message });
  }
};

/**
 * Get all requests (Admin only).
 * Paginated, filterable.
 */
const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, bloodGroup } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const requests = await Request.find(filter)
      .populate('hospitalId', 'facilityName address')
      .populate('reservedUnits', 'unitCode bloodGroup status')
      .populate('alertedDonors', 'fullName bloodGroup phone')
      .populate('acceptedDonors', 'fullName bloodGroup phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Request.countDocuments(filter);

    res.json({
      requests,
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
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { hospitalId: hospital._id };
    if (status) filter.status = status;

    const requests = await Request.find(filter)
      .populate('reservedUnits', 'unitCode bloodGroup status')
      .populate('alertedDonors', 'fullName bloodGroup')
      .populate('acceptedDonors', 'fullName bloodGroup')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Request.countDocuments(filter);

    res.json({
      requests,
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
    const request = await Request.findById(req.params.id)
      .populate('hospitalId', 'facilityName address phone')
      .populate('reservedUnits', 'unitCode bloodGroup status componentType')
      .populate('alertedDonors', 'fullName bloodGroup phone')
      .populate('acceptedDonors', 'fullName bloodGroup phone');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // If hospital role, verify ownership
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: req.user.userId });
      if (!hospital || !request.hospitalId._id.equals(hospital._id)) {
        return res.status(403).json({ message: 'Access denied: not your request' });
      }
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch request', error: error.message });
  }
};

/**
 * Cancel a request (Hospital only).
 * Releases any reserved units.
 */
const cancelRequest = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!request.hospitalId.equals(hospital._id)) {
      return res.status(403).json({ message: 'Access denied: not your request' });
    }

    if (request.status === 'cancelled') {
      return res.status(400).json({ message: 'Request is already cancelled' });
    }

    // Release reserved units
    if (request.reservedUnits && request.reservedUnits.length > 0) {
      await BloodUnit.updateMany(
        { _id: { $in: request.reservedUnits } },
        {
          $set: {
            status: 'available',
            reservedForRequestId: null,
            updatedAt: new Date()
          }
        }
      );
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled and reserved units released', request });
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
    const hospital = await Hospital.findOne({ userId: req.user.userId });
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!request.hospitalId.equals(hospital._id)) {
      return res.status(403).json({ message: 'Access denied: not your request' });
    }

    // Update reserved units to delivered
    if (request.reservedUnits && request.reservedUnits.length > 0) {
      await BloodUnit.updateMany(
        { _id: { $in: request.reservedUnits } },
        {
          $set: {
            status: 'delivered',
            updatedAt: new Date()
          }
        }
      );
    }

    request.status = 'fulfilled';
    request.fulfilledAt = new Date();
    await request.save();

    res.json({ message: 'Units marked as delivered', request });
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({ message: 'Failed to mark as delivered', error: error.message });
  }
};

module.exports = {
  submitRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  cancelRequest,
  markDelivered
};
