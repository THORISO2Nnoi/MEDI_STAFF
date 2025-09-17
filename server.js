const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require('./routes/auth'); // <--- your auth.js

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes); // <--- login endpoint now available at /api/auth/login

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// MongoDB
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
