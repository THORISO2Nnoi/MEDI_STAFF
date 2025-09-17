const express = require('express');
const router = express.Router();
const StaffMember = require('../models/Staff');

router.post('/', async (req, res) => {
  const { staffId, password } = req.body;
  if (!staffId || !password) return res.status(400).json({ message: 'ID & password required' });

  const staff = await StaffMember.findOne({ staffId });
  if (!staff) return res.status(401).json({ message: 'Invalid ID or password' });

  const isMatch = await staff.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid ID or password' });

  res.json({
    message: 'Login successful',
    staff: {
      id: staff._id,
      staffId: staff.staffId,
      fullName: staff.fullName,
      role: staff.role,
      workEmail: staff.workEmail
    }
  });
});

module.exports = router;
