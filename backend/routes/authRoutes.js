const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, authStatus } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login an existing user
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/logout
// @desc    Logout a user and clear cookie
// @access  Public (should ideally be protected, but user needs to be "logged in" to log out)
router.post('/logout', logoutUser);

// @route   GET /api/auth/status
// @desc    Check authentication status
// @access  Public (verifies cookie to determine status)
router.get('/status', authStatus);

module.exports = router;
