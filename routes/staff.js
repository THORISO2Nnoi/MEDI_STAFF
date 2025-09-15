const express = require('express');
const multer = require('multer');
const path = require('path');
const staffController = require('../controllers/staffController');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePic') {
      cb(null, path.join(__dirname, '../uploads/profile_pics'));
    } else {
      cb(null, path.join(__dirname, '../uploads/certificates'));
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
router.post('/', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'certificates' }
]), staffController.addStaff);

router.get('/', staffController.getStaff);

router.get('/:id', staffController.getStaffById);

router.put('/:id', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'certificates' }
]), staffController.updateStaff);

module.exports = router;
