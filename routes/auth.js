const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');       // Admins
const Staff = require('../models/Staff');     // Doctors, Nurses, etc.

// JWT secret key (put in .env for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

/**
 * @route POST /api/auth/login
 * @desc Login for both Admin and Staff
 * @body { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Try finding an Admin first
    let user = await User.findOne({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid email or password' });

      const token = jwt.sign({ id: user._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: 'admin'
      });
    }

    // 2️⃣ Try finding a Staff member if not an admin
    let staff = await Staff.findOne({ workEmail: email });
    if (!staff) return res.status(400).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: staff._id, role: staff.role }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      _id: staff._id,
      name: staff.name,
      email: staff.workEmail,
      role: staff.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
