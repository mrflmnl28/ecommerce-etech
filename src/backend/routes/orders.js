import express from 'express';
import Order from '../models/Order.js';
import OrderHistory from '../models/OrderHistory.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, total } = req.body;
    
    const order = new Order({
      user: req.user._id,
      items,
      total,
      status: 'Pending'
    });

    await order.save();

    const history = new OrderHistory({
      order: order._id,
      status: 'Pending',
      changedBy: req.user._id
    });
    await history.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:id', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username email').populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/status/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    const history = new OrderHistory({
      order: order._id,
      status,
      changedBy: req.user._id
    });
    await history.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
