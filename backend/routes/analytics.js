import express from 'express';
import { protect } from '../middleware/auth.js';
import { analyticsService } from '../services/analyticsService.js';
import { SellerDisclosure } from '../models/index.js';

const router = express.Router();

// Get analytics summary for a disclosure
router.get('/disclosure/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify access - must be the seller
    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: userId },
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    const summary = await analyticsService.getDisclosureSummary(id);

    res.json({
      success: true,
      analytics: summary,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get timeline of events for a disclosure
router.get('/disclosure/:id/timeline', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Verify access
    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: userId },
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    const timeline = await analyticsService.getDisclosureTimeline(id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      timeline,
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get share tracking analytics
router.get('/disclosure/:id/shares', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify access
    const disclosure = await SellerDisclosure.findOne({
      where: { id, seller_id: userId },
    });

    if (!disclosure) {
      return res.status(404).json({ message: 'Disclosure not found' });
    }

    const shares = await analyticsService.getShareAnalytics(id);

    res.json({
      success: true,
      shares,
    });
  } catch (error) {
    console.error('Get share analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get seller's overall analytics
router.get('/seller', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const analytics = await analyticsService.getSellerAnalytics(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
