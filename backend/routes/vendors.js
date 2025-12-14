import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Vendors route - TODO' });
});

export default router;
