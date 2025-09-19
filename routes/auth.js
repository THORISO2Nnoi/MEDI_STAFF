const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');   // Admins
const Staff = require('../models/Staff'); // Doctors, Nurses, etc.

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { workEmail, password } = req.body;

  if (!workEmail || !password)
    return res.status(400).json({ message: 'Work email and password are required' });

  try {
    // 1️⃣ Try finding an Admin first
    const admin = await User.findOne({ workEmail });
    if (admin) {
      if (password !== admin.password)
        return res.status(400).json({ message: 'Invalid work email or password' });

      const token = jwt.sign({ id: admin._id, role: 'Admin' }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({
        token,
        _id: admin._id,
        name: admin.name,
        workEmail: admin.workEmail,
        role: 'Admin'
      });
    }

    // 2️⃣ Try finding a Staff member if not an Admin
    const staff = await Staff.findOne({ workEmail });
    if (!staff) return res.status(400).json({ message: 'Invalid work email or password' });

    if (password !== staff.password)
      return res.status(400).json({ message: 'Invalid work email or password' });

    const token = jwt.sign({ id: staff._id, role: staff.role }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      _id: staff._id,
      name: staff.fullName,
      workEmail: staff.workEmail,
      role: staff.role
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
