const StaffMember = require('../models/Staff');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) 
      return res.status(400).json({ message: 'Email and password are required' });

    // Find staff by workEmail
    const staff = await StaffMember.findOne({ workEmail: email });
    if (!staff) 
      return res.status(401).json({ message: 'Invalid email or password' });

    // Compare password
    const isMatch = await staff.comparePassword(password);
    if (!isMatch) 
      return res.status(401).json({ message: 'Invalid email or password' });

    // Create JWT token
    const token = jwt.sign(
      { id: staff._id, role: staff.role, email: staff.workEmail, staffId: staff.staffId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', staff, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};
