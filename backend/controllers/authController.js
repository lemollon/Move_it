import { asyncHandler } from '../middleware/errorHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import { emailService } from '../services/emailService.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { email, password, role, first_name, last_name, phone } = req.body;

  // Validation
  if (!email || !password || !role) {
    throw new AppError('Please provide email, password, and role', 400);
  }

  // Check if user exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new AppError('User already exists with this email', 400);
  }

  // Validate role
  const validRoles = ['buyer', 'seller', 'vendor'];
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  // Create user
  const user = await User.create({
    email,
    password_hash: password, // Will be hashed in beforeSave hook
    role,
    first_name,
    last_name,
    phone,
  });

  // Generate token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check for user
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if account is active
  if (user.status !== 'active') {
    throw new AppError('Account is not active', 401);
  }

  // Update last login
  await user.update({ last_login: new Date() });

  // Generate token
  const token = user.getSignedJwtToken();

  res.json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Update user details
// @route   PUT /api/auth/update
// @access  Private
export const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    phone: req.body.phone,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByPk(req.user.id);
  await user.update(fieldsToUpdate);

  res.json({
    success: true,
    user: user.toSafeObject(),
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  const user = await User.findByPk(req.user.id);

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password_hash = newPassword;
  await user.save();

  // Generate new token
  const token = user.getSignedJwtToken();

  res.json({
    success: true,
    token,
  });
});

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide an email address', 400);
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    // Don't reveal if email exists - security best practice
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
    return;
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  try {
    // Send email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    // Clear reset token on email failure
    user.clearPasswordResetToken();
    await user.save();

    console.error('Password reset email error:', err);
    throw new AppError('Failed to send password reset email. Please try again later.', 500);
  }
});

// @desc    Reset password with token
// @route   POST /api/auth/resetpassword
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError('Please provide token and new password', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Find user by reset token
  const user = await User.findByResetToken(token);

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password and clear reset token
  user.password_hash = password;
  user.clearPasswordResetToken();
  await user.save();

  // Send confirmation email
  try {
    await emailService.sendPasswordResetSuccess(user);
  } catch (err) {
    // Non-critical - log but don't fail
    console.error('Password reset success email error:', err);
  }

  // Generate new auth token
  const authToken = user.getSignedJwtToken();

  res.json({
    success: true,
    message: 'Password has been reset successfully',
    token: authToken,
    user: user.toSafeObject(),
  });
});
