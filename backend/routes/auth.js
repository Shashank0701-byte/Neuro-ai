const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateAdmin, generateToken, verifyToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { adminLoginSchema } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', 
  authLimiter,
  validateBody(adminLoginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Authenticate admin
    const admin = await authenticateAdmin(username, password);
    
    if (!admin) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(admin);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current admin profile
 * @access  Private (Admin)
 */
router.get('/me', 
  verifyToken,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions
      }
    });
  })
);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify token validity
 * @access  Private
 */
router.post('/verify',
  verifyToken,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      valid: true,
      message: 'Token is valid',
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions
      }
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token removal)
 * @access  Private
 */
router.post('/logout',
  verifyToken,
  asyncHandler(async (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // In production, you might want to implement token blacklisting
    res.status(200).json({
      message: 'Logout successful',
      instruction: 'Please remove the token from client storage'
    });
  })
);

module.exports = router;
