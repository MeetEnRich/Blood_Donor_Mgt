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

const validateDonorUpdate = [
  body('fullName')
    .optional()
    .isString()
    .withMessage('Full name must be a string'),
  body('phone')
    .optional()
    .isString()
    .withMessage('Phone must be a string'),
  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
  body('state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  body('lga')
    .optional()
    .isString()
    .withMessage('LGA must be a string'),
  body('coordinates.latitude')
    .optional()
    .isNumeric()
    .withMessage('Latitude must be a number'),
  body('coordinates.longitude')
    .optional()
    .isNumeric()
    .withMessage('Longitude must be a number'),
  body('genotype')
    .optional()
    .isIn(['AA', 'AS', 'SS', 'AC'])
    .withMessage('Genotype must be AA, AS, SS, or AC'),
  body('medicalHistory')
    .optional()
    .isString()
    .withMessage('Medical history must be a string'),
  handleValidationErrors
];

const validateDonation = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('facilityName')
    .exists({ checkFalsy: true })
    .withMessage('Facility name is required'),
  body('units')
    .isInt({ min: 1 })
    .withMessage('Units must be at least 1'),
  handleValidationErrors
];

module.exports = { validateDonorUpdate, validateDonation };
