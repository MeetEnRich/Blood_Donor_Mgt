const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllHospitals,
  approveHospital,
  suspendHospital,
  getFulfillmentReport,
  getDonorActivityReport,
  getInventoryReport,
  getSUSReport,
  deleteHospital
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// All admin routes require admin role
router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/hospitals', getAllHospitals);
router.put('/hospitals/:id/approve', approveHospital);
router.put('/hospitals/:id/suspend', suspendHospital);
router.get('/reports/fulfillment', getFulfillmentReport);
router.get('/reports/donor-activity', getDonorActivityReport);
router.get('/reports/inventory', getInventoryReport);
router.get('/reports/sus', getSUSReport);
router.delete('/hospitals/:id', deleteHospital);

module.exports = router;
