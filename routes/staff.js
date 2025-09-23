const express = require('express');
const router = express.Router();
const multer = require('multer');
const staffController = require('../controllers/staffController');

// Multer setup
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

module.exports = router;
