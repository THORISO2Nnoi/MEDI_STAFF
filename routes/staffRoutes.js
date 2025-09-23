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

module.exports = router;
