import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: req.params.productId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    const review = new Review({
      user: req.user._id,
      product: req.params.productId,
      rating,
      comment
    });

    await review.save();

    const reviews = await Review.find({ product: req.params.productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(req.params.productId, {
      ratingAverage: avgRating,
      ratingCount: reviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'username');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;
    await review.save();

    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.product, {
      ratingAverage: avgRating,
      ratingCount: reviews.length
    });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    await Product.findByIdAndUpdate(review.product, {
      ratingAverage: avgRating,
      ratingCount: reviews.length
    });

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
