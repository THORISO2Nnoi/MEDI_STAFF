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
    collection: 'staffs'
});

// Password hashing middleware
StaffSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with salt rounds 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
StaffSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Add a method to check if staff exists
StaffSchema.statics.findByEmail = function(email) {
    return this.findOne({ workEmail: email });
};

module.exports = mongoose.model('Staff', StaffSchema);