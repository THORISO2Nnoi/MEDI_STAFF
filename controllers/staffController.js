const StaffMember = require('../models/StaffMember');

// Helper: normalize array fields
const toArray = val =>
  Array.isArray(val)
    ? val
    : (val || '').split(',').map(s => s.trim()).filter(Boolean);

// Add staff
exports.addStaff = async (req, res) => {
  try {
    const data = { ...req.body };

    data.specialization = toArray(req.body.specialization);
    data.qualifications = toArray(req.body.qualifications);
    data.languages = toArray(req.body.languages);

    // Files
    data.profilePic = req.files?.profilePic?.[0]?.path || '';
    data.certificates = (req.files?.certificates || []).map(f => f.path);

    const staff = new StaffMember(data);
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await StaffMember.find();
    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get by ID
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

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const staff = await StaffMember.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    // Text fields
    staff.email = req.body.email || staff.email;
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
    res.json(staff);
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: error.message });
  }
};
