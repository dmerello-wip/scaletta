const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// require('dotenv').config(); // We'll configure this in the main app file

async function registerUser(req, res) {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      password,
    });

    // Password will be hashed by the pre-save hook in User.js
    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}

async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' }); // Security: vague message
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        username: user.username,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'Strict',
          maxAge: 3600000, // 1 hour
        });
        res.json({ msg: 'Login successful', user: { id: user.id, username: user.username } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}

function logoutUser(req, res) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    expires: new Date(0), // Set expiry to a past date
  });
  res.json({ msg: 'Logout successful' });
}

function authStatus(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ isAuthenticated: false, user: null });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If token is invalid (e.g., expired, tampered), clear it
        res.cookie('token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          expires: new Date(0),
        });
        return res.json({ isAuthenticated: false, user: null });
      }
      res.json({
        isAuthenticated: true,
        user: { id: decoded.user.id, username: decoded.user.username },
      });
    });
  } catch (err) {
    console.error('Auth status error:', err.message); // Log specific error
    res.status(500).send('Server error during authentication status check');
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authStatus,
};
