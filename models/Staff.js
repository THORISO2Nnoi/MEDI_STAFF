const mongoose = require('mongoose');

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


module.exports = mongoose.model('Staff', StaffSchema);