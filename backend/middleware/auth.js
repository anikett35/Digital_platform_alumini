// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and authenticate user
 * Attaches user info to req.user
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token, access denied' 
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }
    
    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found, access denied' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Attach user info to request object
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      profileImage: user.profileImage
    };
    
    // Update last login (optional - can be removed if causing performance issues)
    if (!user.lastLogin || Date.now() - user.lastLogin > 3600000) { // Update if > 1 hour
      user.lastLogin = new Date();
      await user.save();
    }
    
    console.log('✓ Authenticated:', req.user.email, `(${req.user.role})`);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Admin only middleware
 * Must be used after auth middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    console.warn(`⚠ Unauthorized admin access attempt by: ${req.user.email}`);
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  console.log('✓ Admin access granted:', req.user.email);
  next();
};

/**
 * Role-based access control
 * Check if user has one of the allowed roles
 * Usage: checkRole('admin', 'alumni')
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(`⚠ Unauthorized access attempt by: ${req.user.email} (${req.user.role})`);
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        currentRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }
    
    console.log(`✓ Role check passed: ${req.user.role}`);
    next();
  };
};

/**
 * Optional authentication
 * Attaches user if token exists but doesn't fail if missing
 * Useful for public endpoints that show different data for logged-in users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next(); // No token, continue without user
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return next(); // No token, continue without user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      };
      console.log('✓ Optional auth: User authenticated');
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user
    console.log('Optional auth: No valid token');
    next();
  }
};

/**
 * Verify user owns the resource
 * Checks if req.user.id matches req.params.userId
 */
const verifyOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  const resourceUserId = req.params.userId || req.params.id;
  
  // Admin can access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if user owns the resource
  if (req.user.id !== resourceUserId) {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. You can only access your own resources.' 
    });
  }

  next();
};

module.exports = {
  auth,
  adminOnly,
  checkRole,
  optionalAuth,
  verifyOwnership
};
