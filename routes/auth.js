const express = require('express');
const router = express.Router();
const StaffMember = require('../models/Staff');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { staffId, password } = req.body;
    if (!staffId || !password) return res.status(400).json({ message: 'ID and password required' });

    const staff = await StaffMember.findOne({ staffId });
    if (!staff) return res.status(401).json({ message: 'Invalid ID or password' });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid ID or password' });

    const token = jwt.sign(
      { id: staff._id, role: staff.role, email: staff.workEmail, staffId: staff.staffId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', staff, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
