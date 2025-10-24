const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Simple in-memory admin store (in production, use a proper database)
const admins = [
  {
    id: 1,
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@neuroaid.com',
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_content']
  }
];

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Token is not valid'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  next();
};

// Check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Permission '${permission}' required`
      });
    }
    next();
  };
};

// Authenticate admin credentials
const authenticateAdmin = async (username, password) => {
  const admin = admins.find(a => a.username === username || a.email === username);
  
  if (!admin) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);
  
  if (!isValidPassword) {
    return null;
  }

  // Return admin without password
  const { password: _, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

module.exports = {
  generateToken,
  verifyToken,
  requireAdmin,
  requirePermission,
  authenticateAdmin
};
