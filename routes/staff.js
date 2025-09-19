const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post(
  '/',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificates', maxCount: 10 }
  ]),
  staffController.addStaff
);

router.put(
  '/:id',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'certificates', maxCount: 10 }
  ]),
  staffController.updateStaff
);

router.delete('/:id', staffController.deleteStaff);
router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);

module.exports = router;
