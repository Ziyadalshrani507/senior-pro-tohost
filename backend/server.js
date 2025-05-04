const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./Routes/authRoutes');
const destinationRoutes = require('./Routes/destinationRoutes');
const passwordResetRoutes = require('./Routes/passwordResetRoutes');
const profileRoutes = require('./Routes/profileRoutes');
const restaurantRoutes = require('./Routes/restaurantRoutes');
const ratingRoutes = require('./Routes/ratingRoutes');
const dashboardRoutes = require('./Routes/dashboardRoutes');
const likeRoutes = require('./Routes/likeRoutes');
const developerRoutes = require('./Routes/developerRoutes');
const User = require('./Models/User');
const { protect } = require('./middleware/authMiddleware');

const hotelRoutes = require('./Routes/hotelRoutes');

// Ensure upload directories exist
const ensureUploadsDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'profiles'),
    path.join(__dirname, 'uploads', 'developers')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Create the directories when the server starts
ensureUploadsDirectories();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true
}));
app.use(cookieParser());

// Request body parser with error handling
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON in request body:', e.message);
      res.status(400).json({ message: 'Invalid JSON in request body', error: e.message });
      throw new Error('Invalid JSON');
    }
  }
}));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {

    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
  }
  next();
});

// Hotel routes are registered below with other API routes

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
    cb(null, true);
  }
});

// Connect to MongoDB only when not in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
} else {
  console.log('Test environment detected - database connection skipped in server.js');
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/users', require('./Routes/userRoutes'));
app.use('/api/developers', developerRoutes);

// Itinerary routes
const itineraryRoutes = require('./Routes/itineraryRoutes');
app.use('/api/itinerary', itineraryRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Frontend catchall handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});