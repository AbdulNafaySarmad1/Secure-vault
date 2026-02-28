const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sequelize = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const notesRoutes = require('./routes/notes.routes');
const filesRoutes = require('./routes/files.routes');
const usersRoutes = require('./routes/users.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();

// Ensure directories exist
['uploads', 'uploads/temp', 'logs'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow Vercel frontend
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'https://securevault.vercel.app',
  /\.vercel\.app$/  // Allow all vercel.app subdomains
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 10000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    await sequelize.sync({ alter: true });
    logger.info('Database synchronized');

    // Run seed if in production and no users exist
    if (process.env.NODE_ENV === 'production') {
      const User = require('./models/user.model');
      const count = await User.count();
      if (count === 0) {
        logger.info('No users found, running seed...');
        const seed = require('./scripts/seed');
        await seed();
      }
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
