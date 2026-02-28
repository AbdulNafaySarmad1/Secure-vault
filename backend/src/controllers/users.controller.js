const User = require('../models/user.model');
const AuditLog = require('../models/auditLog.model');
const RefreshToken = require('../models/refreshToken.model');
const { Op } = require('sequelize');

const usersController = {
  list: async (req, res, next) => {
    try {
      const users = await User.findAll({
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password', 'passwordResetToken', 'passwordResetExpires'] }
      });

      res.json({ users });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role, isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent self-demotion from admin
      if (id === req.user.id && role && role !== 'admin') {
        return res.status(400).json({ error: 'Cannot change own admin status' });
      }

      const oldRole = user.role;
      const oldStatus = user.isActive;

      const updates = {};
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;

      await user.update(updates);

      // If deactivating user, revoke all their tokens
      if (isActive === false && oldStatus === true) {
        await RefreshToken.update(
          { revokedAt: new Date() },
          { where: { userId: id, revokedAt: null } }
        );
      }

      // Log role change
      if (role && role !== oldRole) {
        await AuditLog.create({
          userId: req.user.id,
          action: 'ROLE_CHANGED',
          description: `Changed role of ${user.email} from ${oldRole} to ${role}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: { targetUserId: id, oldRole, newRole: role }
        });
      }

      // Log activation/deactivation
      if (isActive !== undefined && isActive !== oldStatus) {
        await AuditLog.create({
          userId: req.user.id,
          action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          description: `${isActive ? 'Activated' : 'Deactivated'} user: ${user.email}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          metadata: { targetUserId: id }
        });
      }

      res.json({
        message: 'User updated successfully',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = usersController;
