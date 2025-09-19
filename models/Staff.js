const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const staffSchema = new mongoose.Schema({
  staffId: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{13}$/, 'Staff ID must be exactly 13 digits']
  },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['Admin', 'Doctor', 'Nurse'], required: true },
  workEmail: { type: String, required: true, unique: true },
  personalEmail: { type: String, required: true },
  password: { type: String, required: true },
  specialization: { type: [String], default: [] },
  qualifications: { type: [String], default: [] },
  languages: { type: [String], default: [] },
  experience: { type: String },
  hpcsa: { type: String },
  location: { type: String },
  profilePic: { type: String },
  certificates: { type: [String], default: [] },
}, { timestamps: true });

staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

staffSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);
