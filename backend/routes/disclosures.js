import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Placeholder routes - TODO: Implement
router.get('/:propertyId', protect, (req, res) => {
  res.json({ message: 'Get disclosure - TODO' });
});

router.put('/:propertyId', protect, (req, res) => {
  res.json({ message: 'Update disclosure - TODO' });
});

export default router;
