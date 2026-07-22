const express = require('express');
const router = express.Router();
const {
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
  respondToAlert,
  deleteDonor
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const { validateDonorUpdate, validateDonation } = require('../validators/donorValidator');

// Donor routes (authenticated donor)
router.get('/me', protect, restrictTo('donor'), getMyProfile);
router.put('/me', protect, restrictTo('donor'), validateDonorUpdate, updateMyProfile);
router.put('/me/fcm-token', protect, restrictTo('donor'), updateFCMToken);
router.get('/me/eligibility', protect, restrictTo('donor'), checkEligibility);
router.get('/me/alerts', protect, restrictTo('donor'), getMyAlerts);
router.post('/me/respond-alert', protect, restrictTo('donor'), respondToAlert);

// Admin and Hospital routes
router.get('/', protect, restrictTo('admin'), getAllDonors);
router.get('/:id', protect, restrictTo('admin'), getDonorById);
router.put('/:id/approve', protect, restrictTo('admin'), approveDonor);
router.put('/:id/suspend', protect, restrictTo('admin'), suspendDonor);
router.post('/:id/donation', protect, restrictTo('admin', 'hospital'), validateDonation, recordDonation);
router.get('/:id/eligibility', protect, restrictTo('admin'), checkEligibility);
router.delete('/:id', protect, restrictTo('admin'), deleteDonor);

module.exports = router;
