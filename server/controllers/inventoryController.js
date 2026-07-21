const BloodUnit = require('../models/BloodUnit');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { generateUnitCode } = require('../utils/generateUnitCode');
const { Op } = require('sequelize');

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
      const hospital = await Hospital.findOne({ where: { userId: req.user.userId } });
      if (hospital) {
        filter.facilityId = hospital._id;
      }
    }

    if (startDate || endDate) {
      const colFilter = {};
      if (startDate) colFilter[Op.gte] = new Date(startDate);
      if (endDate) colFilter[Op.lte] = new Date(endDate);
      filter.collectionDate = colFilter;
    }

    const { rows: units, count: total } = await BloodUnit.findAndCountAll({
      where: filter,
      include: [
        { model: Donor, as: 'donor', attributes: ['fullName', 'bloodGroup'] },
        { model: Hospital, as: 'hospital', attributes: ['facilityName'] }
      ],
      offset: skip,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    const mappedUnits = units.map(u => {
      const plain = u.toObject();
      plain.donorId = plain.donor || null;
      plain.facilityId = plain.hospital || null;
      return plain;
    });

    res.json({
      units: mappedUnits,
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
    const result = {};

    await Promise.all(groups.map(async (group) => {
      const count = await BloodUnit.count({
        where: {
          status: 'available',
          bloodGroup: group
        }
      });
      result[group] = count;
    }));

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

    const expiringUnits = await BloodUnit.findAll({
      where: {
        status: 'available',
        expirationDate: {
          [Op.lte]: alertThreshold,
          [Op.gt]: now
        }
      },
      include: [
        { model: Hospital, as: 'hospital', attributes: ['facilityName'] },
        { model: Donor, as: 'donor', attributes: ['fullName'] }
      ],
      order: [['expirationDate', 'ASC']]
    });

    const mappedUnits = expiringUnits.map(u => {
      const plain = u.toObject();
      plain.facilityId = plain.hospital || null;
      plain.donorId = plain.donor || null;
      return plain;
    });

    res.json({
      alertDays,
      count: mappedUnits.length,
      units: mappedUnits
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

    const unit = await BloodUnit.create({
      unitCode,
      bloodGroup,
      componentType: componentType || 'Whole Blood',
      collectionDate: new Date(collectionDate),
      expirationDate: new Date(expDate),
      status: 'available',
      donorId: donorId || null,
      facilityId: facilityId || null,
      notes
    });

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

    const unit = await BloodUnit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Blood unit not found' });
    }

    await unit.update(updates);

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
    const unit = await BloodUnit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Blood unit not found' });
    }

    await unit.update({ status: 'discarded' });

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
