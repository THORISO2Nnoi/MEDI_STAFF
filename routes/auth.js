// In your auth route file
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

router.post('/login', async (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Request body:', req.body);

  const { workEmail, password } = req.body;

  if (!workEmail || !password) {
    console.log('Missing email or password');
    return res.status(400).json({
      success: false,
      message: 'Work email and password are required'
    });
  }

  try {
    console.log('Looking for staff with email:', workEmail);

    // Find staff by workEmail
    const staff = await Staff.findOne({ workEmail });
    console.log('Staff found:', staff ? staff.fullName : 'NO STAFF FOUND');

    if (!staff) {
      console.log('No staff found with email:', workEmail);
      return res.status(400).json({
        success: false,
        message: 'Invalid work email or password'
      });
    }

    console.log('Comparing passwords (plain text)...');
    const isMatch = staff.password === password;
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({
        success: false,
        message: 'Invalid work email or password'
      });
    }

    console.log('Creating JWT token...');
    const token = jwt.sign({
      id: staff._id,
      staffId: staff.staffId,
      role: staff.role,
      email: staff.workEmail
    }, JWT_SECRET, { expiresIn: '1d' });

    console.log('Login successful for:', staff.fullName);

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
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', err);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + err.message
    });
  }
});


module.exports = router;