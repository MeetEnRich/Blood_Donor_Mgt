const express = require('express');
const router = express.Router();
const {
  getAllUnits,
  getInventorySummary,
  getExpiryAlerts,
  addUnit,
  updateUnit,
  discardUnit
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { validateBloodUnit } = require('../validators/inventoryValidator');

// Admin and Hospital can view inventory
router.get('/', protect, restrictTo('admin', 'hospital'), getAllUnits);
router.get('/summary', protect, restrictTo('admin', 'hospital'), getInventorySummary);

// Admin and Hospital operations
router.get('/expiry-alerts', protect, restrictTo('admin'), getExpiryAlerts);
router.post('/', protect, restrictTo('admin'), validateBloodUnit, addUnit);
router.put('/:id', protect, restrictTo('admin', 'hospital'), updateUnit);
router.put('/:id/discard', protect, restrictTo('admin', 'hospital'), discardUnit);

module.exports = router;
