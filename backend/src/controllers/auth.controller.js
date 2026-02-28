const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const AuditLog = require('../models/auditLog.model');
const logger = require('../config/logger');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateTokens = async (user, req) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const jti = crypto.randomBytes(16).toString('hex');
  const familyId = crypto.randomBytes(16).toString('hex');

  const refreshToken = jwt.sign(
    { id: user.id, jti, familyId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  await RefreshToken.create({
    userId: user.id,
    tokenHash,
    jti,
    familyId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  return { accessToken, refreshToken };
};

const authController = {
  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Check for mass assignment attempts
      const allowedFields = ['email', 'password'];
      const receivedFields = Object.keys(req.body);
      const extraFields = receivedFields.filter(f => !allowedFields.includes(f));

      if (extraFields.length > 0) {
        return res.status(400).json({ error: 'Invalid fields in request: ' + extraFields.join(', ') });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const user = await User.create({ email, password, role: 'user' });

      await AuditLog.create({
        userId: user.id,
        action: 'USER_CREATED',
        description: `New user registered: ${email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user || !(await user.comparePassword(password))) {
        await AuditLog.create({
          action: 'LOGIN_FAILED',
          description: `Failed login attempt for: ${email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: { email }
        });
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      await user.update({ lastLogin: new Date() });

      const tokens = await generateTokens(user, req);

      await AuditLog.create({
        userId: user.id,
        action: 'LOGIN',
        description: `User logged in: ${email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        ...tokens
      });
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const storedToken = await RefreshToken.findOne({ where: { tokenHash } });

      if (!storedToken) {
        // Possible token reuse attack
        if (decoded.familyId) {
          await RefreshToken.update(
            { revokedAt: new Date() },
            { where: { familyId: decoded.familyId } }
          );

          await AuditLog.create({
            userId: decoded.id,
            action: 'REFRESH_TOKEN_REUSE_DETECTED',
            description: 'Possible token reuse attack detected',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          });
        }
        return res.status(401).json({ error: 'Token reuse detected. Session invalidated.' });
      }

      if (storedToken.revokedAt) {
        return res.status(401).json({ error: 'Token revoked' });
      }

      if (storedToken.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Token expired' });
      }

      // Revoke old token
      await storedToken.update({ revokedAt: new Date() });

      // Generate new tokens
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      const tokens = await generateTokens(user, req);

      await AuditLog.create({
        userId: user.id,
        action: 'REFRESH_TOKEN_ROTATION',
        description: 'Token rotated successfully',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        message: 'Token refreshed',
        ...tokens
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await RefreshToken.update(
          { revokedAt: new Date() },
          { where: { tokenHash } }
        );
      }

      await AuditLog.create({
        userId: req.user.id,
        action: 'LOGOUT',
        description: `User logged out: ${req.user.email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  requestPasswordReset: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: 'If email exists, reset instructions sent' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      await user.update({
        passwordResetToken: resetTokenHash,
        passwordResetExpires: new Date(Date.now() + 3600000) // 1 hour
      });

      await AuditLog.create({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUEST',
        description: 'Password reset requested',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // In production, send email with resetToken
      // For demo, return token in response (not recommended in production)
      res.json({
        message: 'If email exists, reset instructions sent',
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        where: {
          passwordResetToken: tokenHash,
          passwordResetExpires: { $gt: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      await user.update({
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      // Revoke all refresh tokens for this user
      await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { userId: user.id } }
      );

      await AuditLog.create({
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETE',
        description: 'Password reset completed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
