const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnership = (resourceOwnerField = 'owner') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resourceOwner = req.body[resourceOwnerField] || req.params[resourceOwnerField] || req.query[resourceOwnerField];
    
    if (!resourceOwner) {
      return res.status(400).json({ message: 'Resource owner not specified' });
    }

    // Allow if user is admin or owns the resource
    if (req.user.role === 'admin' || req.user._id.toString() === resourceOwner.toString()) {
      return next();
    }

    res.status(403).json({ message: 'Access denied - not authorized to modify this resource' });
  };
};

// Middleware to check if user can access swap (is initiator or recipient)
const requireSwapAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const swapId = req.params.swapId || req.body.swapId;
    if (!swapId) {
      return res.status(400).json({ message: 'Swap ID required' });
    }

    const Swap = require('../models/Swap');
    const swap = await Swap.findById(swapId);

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    const isInitiator = swap.initiator.toString() === req.user._id.toString();
    const isRecipient = swap.recipient.toString() === req.user._id.toString();

    if (!isInitiator && !isRecipient && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied - not authorized to access this swap' });
    }

    req.swap = swap;
    next();
  } catch (error) {
    console.error('Swap access middleware error:', error);
    res.status(500).json({ message: 'Error checking swap access' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership,
  requireSwapAccess,
  optionalAuth
}; 