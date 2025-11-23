import express from 'express';
import OrderHistory from '../models/OrderHistory.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/:orderId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const history = await OrderHistory.find({ order: req.params.orderId }).populate('changedBy', 'username');
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
