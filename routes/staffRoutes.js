const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// --- Add new staff ---
exports.addStaff = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      role,
      specialization = [],
      qualifications = [],
      languages = [],
      experience = '',
      hpcsa = '',
      location = ''
    } = req.body;

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Handle uploaded files
    const profilePic = req.files['profilePic'] ? req.files['profilePic'][0].filename : '';
    const certificates = req.files['certificates']
      ? req.files['certificates'].map(file => file.filename)
      : [];

    const newStaff = new Staff({
      email,
      password: hashedPassword,
      fullName,
      role,
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
    console.error(err);
    res.status(500).json({ message: 'Error adding staff', error: err.message });
  }
};

// --- Get all staff ---
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// --- Get staff by ID ---
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// --- Update staff ---
exports.updateStaff = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Update uploaded files if provided
    if (req.files['profilePic']) updates.profilePic = req.files['profilePic'][0].filename;
    if (req.files['certificates']) {
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
exports.deleteStaff = async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) return res.status(404).json({ message: 'Staff not found' });

    // Optional: delete uploaded files
    if (deletedStaff.profilePic) {
      const profilePath = path.join(__dirname, '../uploads/profile_pics', deletedStaff.profilePic);
      if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
    }
    if (deletedStaff.certificates.length > 0) {
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
module.exports = router;
