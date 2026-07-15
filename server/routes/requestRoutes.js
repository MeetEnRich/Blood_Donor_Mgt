const express = require('express');
const router = express.Router();
const {
  submitRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  cancelRequest,
  markDelivered,
  getHospitalStats
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { validateRequest } = require('../validators/requestValidator');

// Hospital routes
router.post('/', protect, restrictTo('hospital'), validateRequest, submitRequest);
router.get('/my', protect, restrictTo('hospital'), getMyRequests);
router.get('/stats/hospital', protect, restrictTo('hospital'), getHospitalStats);
router.put('/:id/cancel', protect, restrictTo('hospital'), cancelRequest);
router.put('/:id/delivered', protect, restrictTo('hospital'), markDelivered);

// Admin routes
router.get('/', protect, restrictTo('admin'), getAllRequests);

// Shared (admin or owning hospital)
router.get('/:id', protect, restrictTo('admin', 'hospital'), getRequestById);

module.exports = router;
