const mongoose = require('mongoose');

const nurseRequestSchema = new mongoose.Schema({
  nurseId: { type: String, required: true },
  nurseName: { type: String },
  doctorId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model('NurseRequest', nurseRequestSchema);
