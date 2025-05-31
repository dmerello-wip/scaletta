const jwt = require('jsonwebtoken');
const User = require('../models/User');
// require('dotenv').config(); // JWT_SECRET will be available via process.env in the main app

const protect = async (req, res, next) => {
  let token;

  // Check for token in httpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found in cookies, return unauthorized
  if (!token) {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }

  try {
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
  // The "if (!token)" check is now at the beginning after attempting to extract from cookies.
};

module.exports = { protect };
