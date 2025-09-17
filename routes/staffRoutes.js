const express = require('express');
const multer = require('multer');
const path = require('path');
const staffController = require('../controllers/staffController');

const router = express.Router();

// --- Multer storage configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePic') {
      cb(null, path.join(__dirname, '../uploads/profile_pics'));
    } else {
      cb(null, path.join(__dirname, '../uploads/certificates'));
    }
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// --- STAFF ROUTES ---

// Add staff
router.post(
  '/',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificates' }
  ]),
  staffController.addStaff
);

// Get all staff
router.get('/', staffController.getStaff);

// Get staff by ID
router.get('/:id', staffController.getStaffById);

// Update staff by ID
router.put(
  '/:id',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificates' }
  ]),
  staffController.updateStaff
);

// Delete staff by ID
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
