const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRequest = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('unitsRequired')
    .isInt({ min: 1 })
    .withMessage('Units required must be at least 1'),
  body('urgencyLevel')
    .optional()
    .isIn(['Routine', 'Urgent', 'Critical'])
    .withMessage('Urgency level must be Routine, Urgent, or Critical'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  handleValidationErrors
];

module.exports = { validateRequest };
