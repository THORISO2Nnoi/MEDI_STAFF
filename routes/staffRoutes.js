const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const multer = require('multer');
const path = require('path');

// --- Multer setup for file uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePic') cb(null, 'uploads/profile_pics');
    else if (file.fieldname === 'certificates') cb(null, 'uploads/certificates');
    else cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- Routes ---
router.post('/', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'certificates', maxCount: 10 }
]), staffController.addStaff);

router.get('/', staffController.getStaff);
router.get('/:id', staffController.getStaffById);

router.put('/:id', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'certificates', maxCount: 10 }
]), staffController.updateStaff);

router.delete('/:id', staffController.deleteStaff);

module.exports = router;
