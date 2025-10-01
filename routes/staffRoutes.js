const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Staff = require('../models/Staff');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only images and PDF files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Helper: convert string fields to arrays
const processArrayField = (field) => {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string' && field.trim() !== '') return field.split(',').map(i => i.trim());
  return [];
};

// ------------------- Staff Routes -------------------

// Add new staff
router.post('/add', upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'certificates', maxCount: 10 }]), async (req, res) => {
  try {
    let { staffId, fullName, role, workEmail, personalEmail, password, specialization = [], qualifications = [], languages = [], experience = '', hpcsaNumber = '', location = '' } = req.body;

    if (!staffId || !fullName || !role || !workEmail || !personalEmail || !password) {
      if (req.files) Object.values(req.files).flat().forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    workEmail = workEmail.toLowerCase().trim();
    personalEmail = personalEmail.toLowerCase().trim();

    const existingStaff = await Staff.findOne({ $or: [{ staffId }, { workEmail }, { personalEmail }] });
    if (existingStaff) {
      if (req.files) Object.values(req.files).flat().forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
      return res.status(409).json({ success: false, message: 'Staff ID or email already exists' });
    }

    const profilePic = req.files?.profilePic ? req.files.profilePic[0].path : '';
    const certificates = req.files?.certificates ? req.files.certificates.map(f => f.path) : [];

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
    const staffResponse = { ...newStaff._doc };
    delete staffResponse.password;

    res.status(201).json({ success: true, message: 'Staff added successfully', data: staffResponse });

  } catch (error) {
    if (req.files) Object.values(req.files).flat().forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all staff
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find().select('-password');
    res.json({ success: true, data: staff, message: 'Staff retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get staff by workEmail
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const staff = await Staff.findOne({ workEmail: email.toLowerCase() }).select('-password');

    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    res.json({ success: true, data: staff, message: 'Staff retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete staff by staffId
router.delete('/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findOne({ staffId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    if (staff.profilePic && fs.existsSync(staff.profilePic)) fs.unlinkSync(staff.profilePic);
    if (staff.certificates?.length > 0) staff.certificates.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));

    await Staff.findOneAndDelete({ staffId });
    res.json({ success: true, message: `Staff ${staff.fullName} deleted successfully`, data: null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ------------------- Doctor Routes -------------------

// Get all doctors (both singular /doctor and plural /doctors)
router.get(['/doctor', '/doctors'], async (req, res) => {
  try {
    const doctors = await Staff.find({ role: 'Doctor' }).select('-password');
    res.json({ success: true, count: doctors.length, data: doctors, message: 'All doctors retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get doctors with essential fields only
router.get(['/doctor/essential', '/doctors/essential'], async (req, res) => {
  try {
    const doctors = await Staff.find({ role: 'Doctor' })
      .select('staffId fullName specialization qualifications experience languages profilePic location')
      .sort({ fullName: 1 });

    res.json({ success: true, count: doctors.length, data: doctors, message: 'Doctors essential info retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// Get doctors by specialization
router.get(['/doctor/specialization/:specialization', '/doctors/specialization/:specialization'], async (req, res) => {
  try {
    const { specialization } = req.params;
    const doctors = await Staff.find({ role: 'Doctor', specialization: { $regex: specialization, $options: 'i' } }).select('-password');

    res.json({ success: true, count: doctors.length, data: doctors, message: `Doctors with specialization '${specialization}' retrieved successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ------------------- Role Counts -------------------

router.get('/roles/count', async (req, res) => {
  try {
    const roleCounts = await Staff.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({ success: true, data: roleCounts, message: 'Role counts retrieved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
