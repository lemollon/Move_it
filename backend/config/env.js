import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment variable validation and configuration
 */
const requiredEnvVars = [
  'JWT_SECRET',
];

const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: '5000',
  CLIENT_URL: 'http://localhost:3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'moveit_dev',
  DB_USER: 'postgres',
  DB_PASSWORD: '',
  JWT_EXPIRE: '7d',
  LOG_LEVEL: 'info',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
};

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Set defaults for optional variables
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  }

  // Security warnings
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
      warnings.push('JWT_SECRET is using default value in production');
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters in production');
    }

    if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
      warnings.push('DB_PASSWORD is not set in production');
    }
  }

  return { missing, warnings };
}

/**
 * Get typed configuration object
 */
export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'moveit_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    url: process.env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || '',
    refreshExpire: process.env.REFRESH_TOKEN_EXPIRE || '30d',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // External services
  services: {
    resendApiKey: process.env.RESEND_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Feature flags
  features: {
    mlsIntegration: process.env.ENABLE_MLS_INTEGRATION === 'true',
    aiPricing: process.env.ENABLE_AI_PRICING === 'true',
    predictiveIntelligence: process.env.ENABLE_PREDICTIVE_INTELLIGENCE === 'true',
  },

  // Helpers
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isTest: () => process.env.NODE_ENV === 'test',
};

export default config;
