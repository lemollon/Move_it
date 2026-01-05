import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configuration - must be loaded first
import { validateEnv, config } from './config/env.js';

// Routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import disclosureRoutes from './routes/disclosures.js';
import offerRoutes from './routes/offers.js';
import transactionRoutes from './routes/transactions.js';
import vendorRoutes from './routes/vendors.js';
import documentRoutes from './routes/documents.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/uploads.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import {
  requestId,
  sanitizeInput,
  preventParamPollution,
  additionalSecurityHeaders,
  validateContentType,
  blockMaliciousAgents,
} from './middleware/security.js';
import { logger } from './utils/logger.js';

// Database and Models
import { sequelize, syncDatabase } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =====================================================
// STARTUP VALIDATION
// =====================================================

// Validate environment variables
const { missing, warnings } = validateEnv();

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  if (config.isProduction()) {
    process.exit(1);
  }
}

warnings.forEach(warning => {
  logger.warn(`Environment warning: ${warning}`);
});

// Ensure logs directory exists
const logsDir = join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info('Created logs directory');
}

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();
const PORT = config.port;

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// =====================================================
// MIDDLEWARE - Order matters!
// =====================================================

// Request ID for tracing
app.use(requestId);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.clientUrl],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(additionalSecurityHeaders);

// Block malicious user agents
app.use(blockMaliciousAgents);

// CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.clientUrl,
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    if (allowedOrigins.includes(origin) || config.isDevelopment()) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skip: (req) => req.path === '/health',
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgotpassword', authLimiter);

// Body parsing
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Validate content type
app.use('/api/', validateContentType);

// Input sanitization
app.use(sanitizeInput);

// Prevent parameter pollution
app.use(preventParamPollution);

// Logging
const morganFormat = config.isProduction() ? 'combined' : 'dev';
const morganOptions = config.isProduction()
  ? {
      stream: logger.stream,
      skip: (req) => req.path === '/health',
    }
  : {};
app.use(morgan(morganFormat, morganOptions));

// Serve static files (uploaded files)
app.use('/uploads', express.static(join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
}));

// =====================================================
// ROUTES
// =====================================================

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      database: 'disconnected',
      error: config.isDevelopment() ? error.message : 'Database connection failed',
    });
  }
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/disclosures', disclosureRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: req.originalUrl,
    requestId: req.id,
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

app.use(errorHandler);

// =====================================================
// DATABASE & SERVER INITIALIZATION
// =====================================================

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectWithRetry(retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');
      return true;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt}/${retries} failed:`, {
        error: error.message,
      });

      if (attempt < retries) {
        const delay = RETRY_DELAY_MS * attempt;
        logger.info(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

async function startServer() {
  try {
    // Connect to database with retry logic
    const connected = await connectWithRetry();

    if (!connected) {
      logger.error('Failed to connect to database after multiple retries');
      process.exit(1);
    }

    // Sync models (only in development)
    if (config.isDevelopment()) {
      await sequelize.sync({ alter: false });
      logger.info('Database models synchronized');
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Move-it API server running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Client URL: ${config.clientUrl}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} signal received: closing HTTP server`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await sequelize.close();
          logger.info('Database connection closed');
        } catch (error) {
          logger.error('Error closing database connection:', error);
        }

        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  // Don't exit in production - let the process manager handle restarts
  if (!config.isProduction()) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

export default app;
