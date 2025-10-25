const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');
const explainabilityController = require('../controllers/explainabilityController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting configurations
const explanationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 explanation requests per windowMs
  message: {
    error: 'Too many explanation requests',
    message: 'Please wait before making another explanation request',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

const visualizationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit visualization requests to prevent abuse
  message: {
    error: 'Too many visualization requests',
    message: 'Please wait before requesting more visualizations',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please wait before making more requests',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation schemas
const explanationValidation = [
  body('features')
    .isObject()
    .withMessage('Features must be an object')
    .custom((features) => {
      // Check for required feature categories
      const requiredCategories = ['basic', 'lexical', 'cognitive'];
      const missingCategories = requiredCategories.filter(cat => !features[cat]);
      
      if (missingCategories.length > 0) {
        throw new Error(`Missing required feature categories: ${missingCategories.join(', ')}`);
      }
      
      return true;
    }),
  body('prediction')
    .isObject()
    .withMessage('Prediction must be an object')
    .custom((prediction) => {
      if (typeof prediction.riskScore !== 'number' || prediction.riskScore < 0 || prediction.riskScore > 1) {
        throw new Error('Prediction must include a valid riskScore between 0 and 1');
      }
      if (typeof prediction.confidence !== 'number' || prediction.confidence < 0 || prediction.confidence > 1) {
        throw new Error('Prediction must include a valid confidence between 0 and 1');
      }
      return true;
    }),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),
  body('options.types')
    .optional()
    .isArray()
    .withMessage('Explanation types must be an array')
    .custom((types) => {
      const validTypes = ['waterfall', 'force', 'summary', 'dependence', 'bar'];
      const invalidTypes = types.filter(type => !validTypes.includes(type));
      if (invalidTypes.length > 0) {
        throw new Error(`Invalid explanation types: ${invalidTypes.join(', ')}`);
      }
      return true;
    }),
  body('options.includeVisualizations')
    .optional()
    .isBoolean()
    .withMessage('includeVisualizations must be boolean'),
  body('options.visualizationFormat')
    .optional()
    .isIn(['png', 'svg', 'html', 'pdf'])
    .withMessage('Invalid visualization format')
];

const scoreAndExplainValidation = [
  body('features')
    .isObject()
    .withMessage('Features must be an object')
    .custom((features) => {
      const requiredCategories = ['basic', 'lexical', 'cognitive'];
      const missingCategories = requiredCategories.filter(cat => !features[cat]);
      
      if (missingCategories.length > 0) {
        throw new Error(`Missing required feature categories: ${missingCategories.join(', ')}`);
      }
      
      return true;
    }),
  body('scoringOptions')
    .optional()
    .isObject()
    .withMessage('Scoring options must be an object'),
  body('explanationOptions')
    .optional()
    .isObject()
    .withMessage('Explanation options must be an object'),
  body('explanationOptions.types')
    .optional()
    .isArray()
    .withMessage('Explanation types must be an array')
];

const comparisonValidation = [
  body('explanationIds')
    .isArray({ min: 2, max: 10 })
    .withMessage('explanationIds must be an array with 2-10 items'),
  body('explanationIds.*')
    .isUUID()
    .withMessage('Each explanation ID must be a valid UUID'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object')
];

const scoringIdValidation = [
  param('scoringId')
    .isUUID()
    .withMessage('Scoring ID must be a valid UUID')
];

const explanationIdValidation = [
  param('explanationId')
    .isUUID()
    .withMessage('Explanation ID must be a valid UUID')
];

const filenameValidation = [
  param('filename')
    .matches(/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|svg|html|json)$/)
    .withMessage('Invalid filename format')
];

const statsValidation = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('dateFrom must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('dateTo must be a valid ISO 8601 date')
];

// Apply general rate limiting to all routes
router.use(generalLimiter);

/**
 * @route   POST /api/explainability/explain
 * @desc    Generate SHAP explanation for cognitive model prediction
 * @access  Public (with rate limiting)
 * @body    {object} features - Cognitive features used for prediction
 * @body    {object} prediction - Model prediction results
 * @body    {object} [options] - Explanation options
 */
router.post(
  '/explain',
  explanationLimiter,
  explanationValidation,
  explainabilityController.generateExplanation
);

/**
 * @route   POST /api/explainability/explain-score/:scoringId
 * @desc    Generate explanation for existing scoring result
 * @access  Public (with rate limiting)
 * @params  {string} scoringId - Scoring result UUID
 * @body    {object} [options] - Explanation options
 */
router.post(
  '/explain-score/:scoringId',
  explanationLimiter,
  scoringIdValidation,
  body('options').optional().isObject(),
  explainabilityController.explainScore
);

/**
 * @route   POST /api/explainability/score-and-explain
 * @desc    Score features and generate explanation in single request
 * @access  Public (with rate limiting)
 * @body    {object} features - Cognitive features to score and explain
 * @body    {object} [scoringOptions] - Options for scoring
 * @body    {object} [explanationOptions] - Options for explanation
 */
router.post(
  '/score-and-explain',
  explanationLimiter,
  scoreAndExplainValidation,
  explainabilityController.scoreAndExplain
);

/**
 * @route   GET /api/explainability/explanation/:explanationId
 * @desc    Get explanation by ID
 * @access  Public
 * @params  {string} explanationId - Explanation UUID
 */
router.get(
  '/explanation/:explanationId',
  explanationIdValidation,
  explainabilityController.getExplanation
);

/**
 * @route   GET /api/explainability/visualization/:filename
 * @desc    Serve visualization files (images, HTML, etc.)
 * @access  Public (with rate limiting)
 * @params  {string} filename - Visualization filename
 */
router.get(
  '/visualization/:filename',
  visualizationLimiter,
  filenameValidation,
  explainabilityController.getVisualization
);

/**
 * @route   POST /api/explainability/compare
 * @desc    Compare multiple explanations
 * @access  Public (with rate limiting)
 * @body    {array} explanationIds - Array of explanation UUIDs (2-10 items)
 * @body    {object} [options] - Comparison options
 */
router.post(
  '/compare',
  explanationLimiter,
  comparisonValidation,
  explainabilityController.compareExplanations
);

/**
 * @route   GET /api/explainability/health
 * @desc    Get explainability service health status
 * @access  Public
 */
router.get(
  '/health',
  explainabilityController.getHealth
);

/**
 * @route   GET /api/explainability/capabilities
 * @desc    Get explainability service capabilities
 * @access  Public
 */
router.get(
  '/capabilities',
  explainabilityController.getCapabilities
);

/**
 * @route   GET /api/explainability/stats
 * @desc    Get explainability usage statistics
 * @access  Public
 * @query   {string} [dateFrom] - Filter from date (ISO string)
 * @query   {string} [dateTo] - Filter to date (ISO string)
 */
router.get(
  '/stats',
  statsValidation,
  explainabilityController.getStats
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Explainability API Error:', error);
  
  // Handle specific error types
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      message: 'The requested explanation or visualization could not be found'
    });
  }
  
  if (error.code === 'EACCES') {
    return res.status(403).json({
      success: false,
      error: 'Permission denied',
      message: 'Access to the requested resource is denied'
    });
  }
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: error.message
    });
  }

  if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }

  if (error.message && error.message.includes('timeout')) {
    return res.status(408).json({
      success: false,
      error: 'Request timeout',
      message: 'Explanation generation timed out. Please try again with simpler options.'
    });
  }

  if (error.message && error.message.includes('SHAP')) {
    return res.status(503).json({
      success: false,
      error: 'SHAP service unavailable',
      message: 'The SHAP explanation service is currently unavailable. Please try again later.'
    });
  }

  if (error.message && error.message.includes('Python')) {
    return res.status(503).json({
      success: false,
      error: 'Python environment error',
      message: 'Python environment or required packages are not available for explanation generation.'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred during explanation generation',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

module.exports = router;
