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

const validateBloodUnit = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  body('componentType')
    .optional()
    .isIn(['Whole Blood', 'Packed Red Cells', 'Platelets', 'Fresh Frozen Plasma'])
    .withMessage('Invalid component type'),
  body('collectionDate')
    .isISO8601()
    .withMessage('Collection date must be a valid date'),
  body('expirationDate')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid date'),
  body('donorId')
    .optional()
    .isMongoId()
    .withMessage('Donor ID must be a valid MongoDB ObjectId'),
  body('facilityId')
    .optional()
    .isMongoId()
    .withMessage('Facility ID must be a valid MongoDB ObjectId'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  handleValidationErrors
];

module.exports = { validateBloodUnit };
