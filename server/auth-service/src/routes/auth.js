const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validation/authValidation');

// Public Registration is DISABLED
router.post('/register', asyncHandler(async (req, res) => {
  res.status(403);
  throw new Error('Public registration is disabled. Please contact an administrator.');
}));

// Admin: Create User (Instructor/Admin)
const { protect, authorize } = require('../middleware/authMiddleware');

// Create User (Admin/Instructor)
router.post('/create-user', protect, authorize('Admin', 'Instructor'), asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;
  const requesterRole = req.user.role;

  // Role Validation Logic
  if (requesterRole === 'Instructor') {
    if (role !== 'Student') {
      res.status(403);
      throw new Error('Instructors can only create Student accounts');
    }
  } else if (requesterRole === 'Admin') {
    if (!['Instructor', 'Student', 'Admin'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role');
    }
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400);
    throw new Error('Username already exists');
  }

  const user = new User({ username, password, role });
  await user.save();

  res.status(201).json({ message: `${role} created successfully`, user: { id: user._id, username: user.username, role: user.role } });
}));

// Admin: Delete User
router.delete('/users/:id', protect, authorize('Admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ message: 'User removed' });
}));

// Admin: Get All Users
router.get('/users', protect, authorize('Admin'), asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { username, password } = value;
  const user = await User.findOne({ username });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' } // Increased to 30d for better dev experience, can be shortened later
  );

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  });
}));

module.exports = router;
