import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', authValidation.register, register);
router.post('/login', authValidation.login, login);
router.post('/forgotpassword', authValidation.forgotPassword, forgotPassword);
router.post('/resetpassword', authValidation.resetPassword, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/update', protect, authValidation.updateDetails, updateDetails);
router.put('/updatepassword', protect, authValidation.updatePassword, updatePassword);

export default router;
