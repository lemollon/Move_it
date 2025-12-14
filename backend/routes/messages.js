import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, (req, res) => {
  res.json({ message: 'Messages route - TODO' });
});

export default router;
