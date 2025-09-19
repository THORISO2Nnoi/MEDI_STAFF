const express = require('express');
const router = express.Router();
const multer = require('multer');
const staffController = require('../controllers/staffController');
const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePic') cb(null, 'uploads/profile_pics');
    else cb(null, 'uploads/certificates');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- STAFF CRUD ---
router.post(
  '/',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificates', maxCount: 10 }
  ]),
  staffController.addStaff
);

router.get('/', staffController.getStaff);
router.get('/:id', staffController.getStaffById);

router.put(
  '/:id',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificates', maxCount: 10 }
  ]),
  staffController.updateStaff
);

router.delete('/:id', staffController.deleteStaff);

// --- LOGIN for frontend (workEmail + password) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // frontend sends workEmail
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });

    const staff = await Staff.findOne({ workEmail: email });
    if (!staff) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // Return user object matching frontend expectation
    res.json({
      message: 'Login successful',
      user: {
        id: staff._id,
        fullName: staff.fullName,
        role: staff.role,        // must match "Admin", "Doctor", "Nurse"
        email: staff.workEmail   // frontend uses this
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
