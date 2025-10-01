const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// Routes
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require('./routes/auth');
const nurseRequestsRouter = require('./routes/nurseRequests');

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/nurse-requests', nurseRequestsRouter);

// --- Default route ---
app.get('/', (req, res) => res.send('MediStaff API is running'));

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ DB connection error:', err.message));
