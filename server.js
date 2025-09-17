const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// const bcrypt = require('bcrypt');  <-- removed
const User = require('./models/User'); // make sure path is correct

// Routes
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes);

// --- Default route ---
app.get('/', (req, res) => res.send('API is running'));

// --- Function to create default admin (plain-text password) ---
async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@medi.com' });
    if (!existingAdmin) {
      await User.create({
        email: 'admin@medi.com',
        password: 'admin123',  // plain-text password
        role: 'admin'
      });
      console.log('✅ Default admin created: admin@medi.com / admin123');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (err) {
    console.error('❌ Error creating default admin:', err.message);
  }
}

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  createDefaultAdmin();  // runs once after DB connection

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ DB connection error:', err.message));
