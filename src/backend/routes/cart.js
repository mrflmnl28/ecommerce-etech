import express from 'express';
// Correct
import Cart from '../models/Cart.js';

// Incorrect
// import Cart from '../models/cart.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 1. GET CART (Load items when user logs in)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    // If no cart exists for this user, return empty array
    if (!cart) return res.json([]); 
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. ADD TO CART
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, name, price, image, cartId } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Add item to items array
    cart.items.push({ product: productId, name, price, image, cartId });
    await cart.save();

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. REMOVE FROM CART
router.delete('/:cartId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Filter out the item with the specific cartId
    cart.items = cart.items.filter(item => item.cartId !== req.params.cartId);
    await cart.save();

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. CLEAR CART (After Checkout)
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;