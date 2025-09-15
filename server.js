const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const staffRoutes = require('./routes/staffRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // serve uploaded files
app.use('/api/staff', staffRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
  })
  .catch(err => console.error('❌ DB connection error:', err.message));
