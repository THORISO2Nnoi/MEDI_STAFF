const Staff = require('../models/Staff');
const fs = require('fs');
const path = require('path');

// --- Add new staff ---
const addStaff = async (req, res) => {
  try {
    console.log('📩 Add staff request body:', req.body);
    console.log('📁 Add staff files:', req.files);

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
      hpcsa = '',
      location = ''
    } = req.body;

    // Ensure required fields are present
    if (!staffId || !fullName || !role || !workEmail || !personalEmail || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Handle file uploads
    const profilePic = req.files?.['profilePic']
      ? req.files['profilePic'][0].filename
      : '';

    const certificates = req.files?.['certificates']
      ? req.files['certificates'].map(file => file.filename)
      : [];

    // Create staff
    const newStaff = new Staff({
      staffId,
      fullName,
      role,
      workEmail,
      personalEmail,
      password, // will be hashed by pre-save hook
      specialization,
      qualifications,
      languages,
      experience,
      hpcsa,
      location,
      profilePic,
      certificates
    });

    await newStaff.save();
    res.status(201).json({ message: 'Staff added successfully', staff: newStaff });
  } catch (err) {
    console.error('Error adding staff:', err);
    res.status(500).json({ message: 'Error adding staff', error: err.message });
  }
};

// --- Get all staff ---
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// --- Get staff by ID ---
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// --- Update staff ---
const updateStaff = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.files?.['profilePic']) {
      updates.profilePic = req.files['profilePic'][0].filename;
    }
    if (req.files?.['certificates']) {
      updates.certificates = req.files['certificates'].map(file => file.filename);
    }

    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedStaff) return res.status(404).json({ message: 'Staff not found' });

    res.json({ message: 'Staff updated successfully', staff: updatedStaff });
  } catch (err) {
    res.status(500).json({ message: 'Error updating staff', error: err.message });
  }
};

// --- Delete staff ---
const deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) return res.status(404).json({ message: 'Staff not found' });

    // Delete uploaded files from storage
    if (deletedStaff.profilePic) {
      const profilePath = path.join(__dirname, '../uploads/profile_pics', deletedStaff.profilePic);
      if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
    }
    if (deletedStaff.certificates?.length > 0) {
      deletedStaff.certificates.forEach(cert => {
        const certPath = path.join(__dirname, '../uploads/certificates', cert);
        if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
      });
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting staff', error: err.message });
  }
};

module.exports = {
  addStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff
};
