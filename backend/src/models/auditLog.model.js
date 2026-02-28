const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM(
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_COMPLETE', 'NOTE_CREATED', 'NOTE_UPDATED',
      'NOTE_DELETED', 'FILE_UPLOADED', 'FILE_DELETED',
      'USER_CREATED', 'USER_UPDATED', 'USER_DEACTIVATED',
      'USER_ACTIVATED', 'ROLE_CHANGED', 'REFRESH_TOKEN_ROTATION',
      'REFRESH_TOKEN_REUSE_DETECTED'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true
});

module.exports = AuditLog;
