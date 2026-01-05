import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getBuyerDisclosures,
  getSharedDisclosure,
  acknowledgeDisclosure,
  signDisclosure,
  viewDisclosureByToken,
  getBuyerDashboardStats,
} from '../controllers/buyerController.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard/stats', protect, getBuyerDashboardStats);

// Public route for viewing disclosure via token
router.get('/disclosures/view/:token', viewDisclosureByToken);

// Protected routes
router.get('/disclosures', protect, getBuyerDisclosures);
router.get('/disclosures/:id', protect, getSharedDisclosure);
router.post('/disclosures/:id/acknowledge', protect, acknowledgeDisclosure);
router.post('/disclosures/:id/sign', protect, signDisclosure);

export default router;
