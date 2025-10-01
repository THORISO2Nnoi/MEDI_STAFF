const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Staff = require('../models/Staff');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Add new staff with file uploads
router.post('/add', upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'certificates', maxCount: 10 }
]), async (req, res) => {
  try {
    const {
      staffId,
      fullName,
      role,
      workEmail,
      personalEmail,
      password,
      specialization = [],
      qualifications = [],
      languages = [],
      experience = '',
      hpcsaNumber = '',
      location = ''
    } = req.body;

    // Basic validation
    if (!staffId || !fullName || !role || !workEmail || !personalEmail || !password) {
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        });
      }
      return res.status(400).json({ 
        success: false,
        message: 'Please fill in all required fields' 
      });
    }

    // Check for existing staff
    const existingStaff = await Staff.findOne({ 
      $or: [{ staffId }, { workEmail }, { personalEmail }] 
    });
    if (existingStaff) {
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        });
      }
      return res.status(409).json({ 
        success: false,
        message: 'Staff ID or email already exists' 
      });
    }

    // Handle file paths
    const profilePic = req.files?.profilePic ? req.files.profilePic[0].path : '';
    const certificates = req.files?.certificates ? req.files.certificates.map(file => file.path) : [];

    // Convert string fields to arrays if needed
    const processArrayField = (field) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string' && field.trim() !== '') {
        return field.split(',').map(item => item.trim());
      }
      return [];
    };

    // Create staff object
    const newStaff = new Staff({
      staffId,
      fullName,
      role,
      workEmail,
      personalEmail,
      password,
      specialization: processArrayField(specialization),
      qualifications: processArrayField(qualifications),
      languages: processArrayField(languages),
      experience,
      hpcsaNumber,
      location,
      profilePic,
      certificates
    });

    await newStaff.save();
    
    // Return without password
    const staffResponse = { ...newStaff._doc };
    delete staffResponse.password;

    res.status(201).json({ 
      success: true,
      message: 'Staff added successfully', 
      data: staffResponse 
    });

  } catch (error) {
    console.error(error);
    
    if (req.files) {
      Object.values(req.files).forEach(files => {
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all staff - FIXED RESPONSE FORMAT
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().select('-password');
    res.json({
      success: true,
      data: staff,
      message: 'Staff retrieved successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Get staff by workEmail
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const staff = await Staff.findOne({ workEmail: email }).select('-password');

    if (!staff) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff not found' 
      });
    }

    res.json({
      success: true,
      data: staff,
      message: 'Staff retrieved successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete a staff member by staffId
router.delete('/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findOne({ staffId });
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff not found' 
      });
    }

    // Delete associated files
    if (staff.profilePic && fs.existsSync(staff.profilePic)) {
      fs.unlinkSync(staff.profilePic);
    }
    
    if (staff.certificates && staff.certificates.length > 0) {
      staff.certificates.forEach(certificate => {
        if (fs.existsSync(certificate)) {
          fs.unlinkSync(certificate);
        }
      });
    }

    await Staff.findOneAndDelete({ staffId });

    res.json({ 
      success: true,
      message: `Staff ${staff.fullName} deleted successfully`,
      data: null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;