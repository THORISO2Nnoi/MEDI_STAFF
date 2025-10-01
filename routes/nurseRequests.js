const express = require('express');
const router = express.Router();
const NurseRequest = require('../models/NurseRequest');

// Get all nurse requests
router.get('/', async (req, res) => {
  try {
    const requests = await NurseRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a new nurse request
router.post('/', async (req, res) => {
  try {
    const { nurseId, nurseName, doctorId, reason } = req.body;
    
    const newRequest = new NurseRequest({
      nurseId,
      nurseName,
      doctorId,
      reason,
      status: 'Pending'
    });
    
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark a request as attended
router.put('/:id', async (req, res) => {
  try {
    const request = await NurseRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = req.body.status || request.status;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
