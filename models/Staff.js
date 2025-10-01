const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StaffSchema = new mongoose.Schema({
    staffId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    role: { type: String, required: true, enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    workEmail: { type: String, required: true, unique: true },
    personalEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    experience: { type: String, default: '' },
    hpcsaNumber: { type: String, default: '' },
    location: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    certificates: { type: [String], default: [] }
}, { 
    timestamps: true,
    collection: 'staffs' // Explicitly set collection name
});

// Add password hashing middleware
StaffSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Add comparePassword method
StaffSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', StaffSchema);