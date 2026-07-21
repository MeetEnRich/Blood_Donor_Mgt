const SurveyResponse = require('../models/SurveyResponse');
const { calculateSUS } = require('../utils/susCalculator');

/**
 * Submit a SUS survey (any authenticated user).
 * Validates 10 responses (1-5 each), calculates SUS score server-side.
 */
const submitSurvey = async (req, res) => {
  try {
    const { responses } = req.body;

    // Validate responses
    if (!responses || !Array.isArray(responses) || responses.length !== 10) {
      return res.status(400).json({ message: 'Exactly 10 responses are required' });
    }

    for (let i = 0; i < responses.length; i++) {
      const val = responses[i];
      if (typeof val !== 'number' || val < 1 || val > 5) {
        return res.status(400).json({
          message: `Response ${i + 1} must be a number between 1 and 5`
        });
      }
    }

    // Check if user already submitted
    const existing = await SurveyResponse.findOne({ where: { userId: req.user.userId } });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted a survey' });
    }

    // Calculate SUS score
    const susScore = calculateSUS(responses);

    const survey = await SurveyResponse.create({
      userId: req.user.userId,
      role: req.user.role,
      responses,
      susScore
    });

    res.status(201).json({
      message: 'Survey submitted successfully',
      susScore,
      survey
    });
  } catch (error) {
    console.error('Submit survey error:', error);
    res.status(500).json({ message: 'Failed to submit survey', error: error.message });
  }
};

/**
 * Check if current user has already submitted a survey.
 */
const checkMySurvey = async (req, res) => {
  try {
    const survey = await SurveyResponse.findOne({ where: { userId: req.user.userId } });

    res.json({
      hasSubmitted: !!survey,
      survey: survey || null
    });
  } catch (error) {
    console.error('Check survey error:', error);
    res.status(500).json({ message: 'Failed to check survey status', error: error.message });
  }
};

module.exports = { submitSurvey, checkMySurvey };
