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
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount routes
// Note: Task description said /api/users for authRoutes, but /api/auth was used in authRoutes.js.
// I will use /api/auth as it's more consistent with the route file.
app.use('/api/auth', authRoutes); 
app.use('/api/songs', songRoutes);

// Basic Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  // If headersSent is true, it means a response has already been sent,
  // so delegate to the default Express error handler to close the connection.
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for potential testing
