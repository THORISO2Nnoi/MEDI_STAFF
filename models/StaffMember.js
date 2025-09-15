const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, required: true },
  specialization: [String],
  qualifications: [String],
  experience: String,
  hpcsa: String,
  location: String,
  languages: [String],
  profilePic: String,      // store path as string
  certificates: [String]   // store array of strings
}, { timestamps: true, collection: 'StaffMembers' });

module.exports = mongoose.model('StaffMember', staffSchema);
