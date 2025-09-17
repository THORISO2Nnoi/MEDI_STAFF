const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes
const staffRoutes = require('./routes/staffRoutes');

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve uploaded files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
if (staffRoutes && typeof staffRoutes === 'function' || staffRoutes?.stack) {
  app.use('/api/staff', staffRoutes);
} else {
  console.error('❌ staffRoutes is not a valid router');
}

// --- Default route ---
app.get('/', (req, res) => {
  res.send('API is running');
});

// --- Connect to MongoDB and start server ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection error:', err.message);
  });
