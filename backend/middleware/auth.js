import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorHandler.js';
import { AppError } from './errorHandler.js';
import User from '../models/User.js';

// Protect routes - require authentication
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!req.user) {
      throw new AppError('User no longer exists', 401);
    }

    if (req.user.status !== 'active') {
      throw new AppError('User account is not active', 401);
    }

    next();
  } catch (error) {
    throw new AppError('Not authorized to access this route', 401);
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `User role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};
