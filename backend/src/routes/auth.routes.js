const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validators = require('../middleware/validation.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: { error: 'Too many attempts. Please try again later.' }
});

router.post('/register', authLimiter, validators.register, authController.register);
router.post('/login', authLimiter, validators.login, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/password-reset', strictLimiter, authController.requestPasswordReset);
router.post('/reset-password', strictLimiter, authController.resetPassword);

module.exports = router;
