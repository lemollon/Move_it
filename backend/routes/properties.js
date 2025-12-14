import express from 'express';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Placeholder routes - TODO: Implement
router.get('/', (req, res) => {
  res.json({ message: 'Properties route - TODO' });
});

router.post('/', protect, authorize('seller'), (req, res) => {
  res.json({ message: 'Create property - TODO' });
});

export default router;
