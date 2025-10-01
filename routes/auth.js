const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

router.post('/login', async (req, res) => {
  const { workEmail, password } = req.body;

  if (!workEmail || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Work email and password are required' 
    });
  }

  try {
    // Find staff by workEmail (handles all roles: Admin, Doctor, Nurse, Receptionist)
    const staff = await Staff.findOne({ workEmail });
    if (!staff) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid work email or password' 
      });
    }

    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid work email or password' 
      });
    }

    const token = jwt.sign({ 
      id: staff._id, 
      staffId: staff.staffId,
      role: staff.role,
      email: staff.workEmail 
    }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      _id: staff._id,
      name: staff.fullName,
      workEmail: staff.workEmail,
      role: staff.role
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
