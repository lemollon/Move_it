import { logger } from '../utils/logger.js';

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with request context
  logger.error(`Error: ${err.message}`, {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
    errorName: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors?.map(val => val.message).join(', ') || 'Validation error';
    error = new AppError(message, 400);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    const message = `A record with this ${field} already exists`;
    error = new AppError(message, 400);
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referenced resource does not exist';
    error = new AppError(message, 400);
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    const message = process.env.NODE_ENV === 'development'
      ? `Database error: ${err.message}`
      : 'Database error occurred';
    error = new AppError(message, 500);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired';
    error = new AppError(message, 401);
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the maximum allowed limit';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    error = new AppError(message, 400);
  }

  // Rate limit error
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = new AppError(message, 429);
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    const message = 'Cross-origin request not allowed';
    error = new AppError(message, 403);
  }

  // Default to 500 if no statusCode
  const statusCode = error.statusCode || 500;

  // Send response
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(req.id && { requestId: req.id }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.errors,
    }),
  });
};

// Async handler wrapper to avoid try-catch in controllers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};
