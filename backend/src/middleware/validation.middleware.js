const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const validators = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    handleValidationErrors
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    handleValidationErrors
  ],

  note: [
    body('title').trim().notEmpty().withMessage('Title required')
      .isLength({ max: 255 }).withMessage('Title too long'),
    body('content').trim().notEmpty().withMessage('Content required'),
    handleValidationErrors
  ],

  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    handleValidationErrors
  ],

  userUpdate: [
    body('role').optional().isIn(['admin', 'user', 'guest']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    handleValidationErrors
  ]
};

module.exports = validators;
