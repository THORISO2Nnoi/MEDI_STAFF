const StaffMember = require('../models/Staff');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Normalize array fields
const toArray = val =>
  Array.isArray(val)
    ? val
    : (val || '').split(',').map(s => s.trim()).filter(Boolean);

// Nodemailer setup (use env vars)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Random password generator
const generateRandomPassword = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
};

// Add staff
exports.addStaff = async (req, res) => {
  try {
    const data = { ...req.body };

    // Ensure unique work email
    if (await StaffMember.findOne({ workEmail: data.workEmail })) {
      return res.status(400).json({ message: 'Work email exists' });
    }

    data.specialization = toArray(data.specialization);
    data.qualifications = toArray(data.qualifications);
    data.languages = toArray(data.languages);

    // Files
    data.profilePic = req.files?.profilePic?.[0]?.path || '';
    data.certificates = (req.files?.certificates || []).map(f => f.path);

    // Generate hashed password
    const plainPassword = generateRandomPassword();
    data.password = await bcrypt.hash(plainPassword, 10);

    const staff = new StaffMember(data);
    await staff.save();

    // Send credentials to personal email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.personalEmail,
      subject: 'MediStaff Login Credentials',
      text: `Hello ${data.fullName},\n\nYour MediStaff account is ready.\nStaff ID: ${data.staffId}\nPassword: ${plainPassword}\nUse your staff ID to login.`
    });

    res.status(201).json({ message: 'Staff added and credentials sent', staff });

  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({ message: error.message });
  }
};


// --- Get staff by ID ---
exports.getStaffById = async (req, res) => {
  try {
    const staff = await StaffMember.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({ message: error.message });
  }
};

// --- Update staff ---
exports.updateStaff = async (req, res) => {
  try {
    const staff = await StaffMember.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Text fields
    staff.workEmail = req.body.workEmail || staff.workEmail;
    staff.personalEmail = req.body.personalEmail || staff.personalEmail;
    staff.fullName = req.body.fullName || staff.fullName;
    staff.role = req.body.role || staff.role;
    staff.specialization = toArray(req.body.specialization) || staff.specialization;
    staff.qualifications = toArray(req.body.qualifications) || staff.qualifications;
    staff.languages = toArray(req.body.languages) || staff.languages;
    staff.experience = req.body.experience || staff.experience;
    staff.hpcsa = req.body.hpcsa || staff.hpcsa;
    staff.location = req.body.location || staff.location;

    // Files
    if (req.files?.profilePic?.[0]) staff.profilePic = req.files.profilePic[0].path;
    if (req.files?.certificates?.length) staff.certificates = req.files.certificates.map(f => f.path);

    await staff.save();
    res.json({ message: 'Staff updated', staff });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: error.message });
  }
};
