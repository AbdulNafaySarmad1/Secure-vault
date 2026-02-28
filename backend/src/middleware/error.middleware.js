const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Resource already exists',
      details: err.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size exceeds limit.' });
  }

  if (err.message === 'Invalid file type') {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and PDF allowed.' });
  }

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
};

module.exports = errorHandler;
