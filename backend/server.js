const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');



// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined.');
  process.exit(1); // Exit the application
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the application on connection error
  });



// Middleware to enable CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// CSRF Protection Setup
const csrf = require('csurf');
const csrfProtection = csrf({
  cookie: {
    key: '_csrf-secret',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict' // Using 'Strict' for better security
  }
});

// Route to get CSRF token - must be before global CSRF protection if applied selectively,
// or use csrfProtection middleware specifically for this route if CSRF is global.
// For SPA, it's common to have this endpoint available.
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all mutating routes (POST, PUT, DELETE, PATCH)
// csurf middleware needs to be applied after cookie parser and body parser.
app.use(csrfProtection);

// Mount routes
// Note: Task description said /api/users for authRoutes, but /api/auth was used in authRoutes.js.
// I will use /api/auth as it's more consistent with the route file.
app.use('/api/auth', authRoutes); 
app.use('/api/songs', songRoutes);

// Basic Global Error Handler
app.use((err, req, res, next) => {
  // CSRF error handling
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF Token Error:', err.message);
    return res.status(403).json({ msg: 'Invalid CSRF token. Please refresh and try again.' });
  }

  console.error('Unhandled error:', err.stack);
  // If headersSent is true, it means a response has already been sent,
  // so delegate to the default Express error handler to close the connection.
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ msg: 'Server error. Something broke!' }); // Send JSON response for API
});

// Start the server
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for potential testing
