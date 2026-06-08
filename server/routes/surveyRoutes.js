const express = require('express');
const router = express.Router();
const { submitSurvey, checkMySurvey } = require('../controllers/surveyController');
const { protect } = require('../middleware/authMiddleware');

// All survey routes require authentication
router.post('/', protect, submitSurvey);
router.get('/me', protect, checkMySurvey);

module.exports = router;
