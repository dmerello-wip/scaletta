const jwt = require('jsonwebtoken');
const User = require('../models/User');
// require('dotenv').config(); // JWT_SECRET will be available via process.env in the main app

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      // We select '-password' to exclude the password hash
      req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ msg: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Not authorized, token failed' });
      }
      res.status(500).json({ msg: 'Server error during token verification' });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

module.exports = { protect };
