const AuditLog = require('../models/auditLog.model');
const logger = require('../config/logger');

const sensitiveActions = [
  'POST:/api/auth/login',
  'POST:/api/auth/logout',
  'POST:/api/auth/password-reset',
  'POST:/api/auth/reset-password',
  'POST:/api/notes',
  'PUT:/api/notes',
  'DELETE:/api/notes',
  'POST:/api/files',
  'DELETE:/api/files',
  'PUT:/api/users',
  'DELETE:/api/users'
];

const auditLogger = (action, description, metadata = {}) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Log after response is sent
      res.on('finish', async () => {
        try {
          if (res.statusCode < 400 || action.includes('FAILED')) {
            await AuditLog.create({
              userId: req.user?.id || null,
              action: action,
              description: description,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              metadata: {
                ...metadata,
                body: sanitizeBody(req.body),
                params: req.params,
                statusCode: res.statusCode
              }
            });
          }
        } catch (err) {
          logger.error('Audit log error:', err);
        }
      });

      return originalJson(data);
    };

    next();
  };
};

const sanitizeBody = (body) => {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.refreshToken;
  return sanitized;
};

const autoAudit = () => {
  return async (req, res, next) => {
    const key = `${req.method}:${req.route?.path || req.path}`;

    if (sensitiveActions.some(action => key.includes(action))) {
      // Will be handled by specific controllers
    }

    next();
  };
};

module.exports = { auditLogger, autoAudit };
