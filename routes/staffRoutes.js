const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff'); // your Staff model

// Add new staff
router.post('/add', async (req, res) => {
    try {
        const {
            staffId,
            fullName,
            role,
            workEmail,
            personalEmail,
            password,
            specialization,
            qualifications,
            languages,
            experience,
            hpcsaNumber,
            location
        } = req.body;

        // Basic validation
        if (!staffId || !fullName || !role || !workEmail || !personalEmail || !password) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        // Check for existing staff ID or email
        const existingStaff = await Staff.findOne({ $or: [{ staffId }, { workEmail }, { personalEmail }] });
        if (existingStaff) {
            return res.status(409).json({ message: 'Staff ID or email already exists' });
        }

        // Create staff object
        const newStaff = new Staff({
            staffId,
            fullName,
            role,
            workEmail,
            personalEmail,
            password, // In production, hash password!
            specialization: specialization || [],
            qualifications: qualifications || [],
            languages: languages || [],
            experience: experience || '',
            hpcsaNumber: hpcsaNumber || '',
            location: location || ''
        });

        await newStaff.save();
        res.status(201).json({ message: 'Staff added successfully', staff: newStaff });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- GET all staff ---
router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find();
        res.json(staff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all staff
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find(); // fetches from 'staffs' collection
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Delete a staff member by staffId
router.delete('/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;

    const deletedStaff = await Staff.findOneAndDelete({ staffId });

    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: `Staff ${deletedStaff.fullName} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get a specific staff member by staffId
router.get('/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findOne({ staffId }); // fetch from the 'staffs' collection

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a staff member by staffId
router.put('/:staffId', async (req, res) => {
  try {
    const { staffId } = req.params;
    const {
      fullName,
      role,
      workEmail,
      personalEmail,
      password,
      specialization,
      qualifications,
      languages,
      experience,
      hpcsaNumber,
      location
    } = req.body;

    const updatedStaff = await Staff.findOneAndUpdate(
      { staffId },
      {
        fullName,
        role,
        workEmail,
        personalEmail,
        password, // keep plain text for now; hash in production
        specialization: specialization || [],
        qualifications: qualifications || [],
        languages: languages || [],
        experience: experience || '',
        hpcsaNumber: hpcsaNumber || '',
        location: location || ''
      },
      { new: true } // return updated document
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({ message: 'Staff updated successfully', staff: updatedStaff });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




module.exports = router;
