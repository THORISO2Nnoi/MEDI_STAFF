const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // <-- make sure this path is correct

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
app.use('/api/auth', authRoutes); // login available at /api/auth/login

// --- Default route ---
app.get('/', (req, res) => res.send('API is running'));

// --- Function to create default admin ---
async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@medi.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@medi.com',
        password: hashedPassword,
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
  createDefaultAdmin();  // <--- runs once after DB connection

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ DB connection error:', err.message));
