const BloodUnit = require('../models/BloodUnit');
const { generateUnitCode } = require('../utils/generateUnitCode');

/**
 * Get all blood units (Admin/Hospital).
 * Filterable by bloodGroup, status, date range. Paginated.
 */
const getAllUnits = async (req, res) => {
  try {
    const { page = 1, limit = 20, bloodGroup, status, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (status) filter.status = status;

    if (req.user.role === 'hospital') {
      const Hospital = require('../models/Hospital');
      const hospital = await Hospital.findOne({ userId: req.user.userId });
      if (hospital) {
        filter.facilityId = hospital._id;
      }
    }

    if (startDate || endDate) {
      filter.collectionDate = {};
      if (startDate) filter.collectionDate.$gte = new Date(startDate);
      if (endDate) filter.collectionDate.$lte = new Date(endDate);
    }

    const units = await BloodUnit.find(filter)
      .populate('donorId', 'fullName bloodGroup')
      .populate('facilityId', 'facilityName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await BloodUnit.countDocuments(filter);

    res.json({
      units,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all units error:', error);
    res.status(500).json({ message: 'Failed to fetch blood units', error: error.message });
  }
};

/**
 * Get inventory summary (Admin/Hospital).
 * Count of available units per blood group.
 */
const getInventorySummary = async (req, res) => {
  try {
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const summary = await BloodUnit.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    // Build a complete summary with all groups (0 for missing ones)
    const result = {};
    groups.forEach(group => {
      const found = summary.find(s => s._id === group);
      result[group] = found ? found.count : 0;
    });

    const totalAvailable = Object.values(result).reduce((a, b) => a + b, 0);

    res.json({
      summary: result,
      totalAvailable
    });
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory summary', error: error.message });
  }
};

/**
 * Get expiry alerts (Admin only).
 * Units expiring within EXPIRY_ALERT_DAYS days.
 */
const getExpiryAlerts = async (req, res) => {
  try {
    const alertDays = parseInt(process.env.EXPIRY_ALERT_DAYS) || 3;
    const now = new Date();
    const alertThreshold = new Date(now.getTime() + alertDays * 24 * 60 * 60 * 1000);

    const expiringUnits = await BloodUnit.find({
      status: 'available',
      expirationDate: { $lte: alertThreshold, $gt: now }
    })
      .populate('facilityId', 'facilityName')
      .populate('donorId', 'fullName')
      .sort({ expirationDate: 1 })
      .lean();

    res.json({
      alertDays,
      count: expiringUnits.length,
      units: expiringUnits
    });
  } catch (error) {
    console.error('Get expiry alerts error:', error);
    res.status(500).json({ message: 'Failed to fetch expiry alerts', error: error.message });
  }
};

/**
 * Add a new blood unit (Admin only).
 * Auto-generates unitCode.
 */
const addUnit = async (req, res) => {
  try {
    const {
      bloodGroup, componentType, collectionDate, expirationDate,
      donorId, facilityId, notes
    } = req.body;

    // Generate unique unit code
    const unitCode = await generateUnitCode();

    // Calculate expiration date if not provided (default: 42 days for whole blood)
    let expDate = expirationDate;
    if (!expDate) {
      expDate = new Date(new Date(collectionDate).getTime() + 42 * 24 * 60 * 60 * 1000);
    }

    const unit = new BloodUnit({
      unitCode,
      bloodGroup,
      componentType: componentType || 'Whole Blood',
      collectionDate: new Date(collectionDate),
      expirationDate: new Date(expDate),
      status: 'available',
      donorId,
      facilityId,
      notes
    });

    await unit.save();

    res.status(201).json({
      message: 'Blood unit added successfully',
      unit
    });
  } catch (error) {
    console.error('Add unit error:', error);
    res.status(500).json({ message: 'Failed to add blood unit', error: error.message });
  }
};

/**
 * Update a blood unit (Admin only).
 */
const updateUnit = async (req, res) => {
  try {
    const allowedFields = [
      'status', 'notes', 'componentType', 'expirationDate',
      'donorId', 'facilityId'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const unit = await BloodUnit.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!unit) {
      return res.status(404).json({ message: 'Blood unit not found' });
    }

    res.json({ message: 'Blood unit updated successfully', unit });
  } catch (error) {
    console.error('Update unit error:', error);
    res.status(500).json({ message: 'Failed to update blood unit', error: error.message });
  }
};

/**
 * Discard a blood unit (Admin only).
 * Sets status to 'discarded'. Keeps the record.
 */
const discardUnit = async (req, res) => {
  try {
    const unit = await BloodUnit.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'discarded', updatedAt: new Date() } },
      { new: true }
    );

    if (!unit) {
      return res.status(404).json({ message: 'Blood unit not found' });
    }

    res.json({ message: 'Blood unit discarded successfully', unit });
  } catch (error) {
    console.error('Discard unit error:', error);
    res.status(500).json({ message: 'Failed to discard blood unit', error: error.message });
  }
};

module.exports = {
  getAllUnits,
  getInventorySummary,
  getExpiryAlerts,
  addUnit,
  updateUnit,
  discardUnit
};
