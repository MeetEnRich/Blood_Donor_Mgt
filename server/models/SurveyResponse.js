const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'hospital', 'donor']
  },
  responses: [{
    type: Number,
    min: 1,
    max: 5
  }],
  susScore: {
    type: Number
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
