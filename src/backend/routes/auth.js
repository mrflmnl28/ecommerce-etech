import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
        token, 
        user: { _id: user._id, username, email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
        token, 
        user: { _id: user._id, username: user.username, email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// PROTECTED USER ROUTES
// ==========================================

// 3. GET CURRENT USER PROFILE
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. UPDATE OWN PROFILE (MUST BE BEFORE ADMIN ROUTES)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // Pre-save hook handles hashing

    await user.save();
    
    res.json({ 
        _id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ADMIN ROUTES (Admin Role Required)
// ==========================================

// 5. GET ALL USERS
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. UPDATE USER (ADMIN EDIT)
// This route uses :id, so it catches anything that looks like an ID.
// That is why /profile MUST be defined above this one.
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { username, email, role },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. DELETE USER
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;