const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');
const cognitiveModelController = require('../controllers/cognitiveModelController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting configurations
const scoringLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 scoring requests per windowMs
  message: {
    error: 'Too many scoring requests',
    message: 'Please wait before making another scoring request',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

const batchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit batch scoring to 5 requests per windowMs
  message: {
    error: 'Too many batch requests',
    message: 'Batch scoring is limited to prevent system overload',
    retryAfter: 900
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
const featureScoringValidation = [
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
      
      // Validate basic features
      if (features.basic) {
        const basicFeatures = ['wordCount', 'sentenceCount', 'typeTokenRatio'];
        for (const feature of basicFeatures) {
          if (features.basic[feature] === undefined || typeof features.basic[feature] !== 'number') {
            throw new Error(`Invalid or missing basic feature: ${feature}`);
          }
        }
      }
      
      // Validate lexical features
      if (features.lexical) {
        const lexicalFeatures = ['vocabularySize', 'lexicalDiversity'];
        for (const feature of lexicalFeatures) {
          if (features.lexical[feature] === undefined || typeof features.lexical[feature] !== 'number') {
            throw new Error(`Invalid or missing lexical feature: ${feature}`);
          }
        }
      }
      
      // Validate cognitive features
      if (features.cognitive) {
        const cognitiveFeatures = ['cognitiveHealthScore'];
        for (const feature of cognitiveFeatures) {
          if (features.cognitive[feature] === undefined || typeof features.cognitive[feature] !== 'number') {
            throw new Error(`Invalid or missing cognitive feature: ${feature}`);
          }
        }
      }
      
      return true;
    }),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),
  body('options.modelType')
    .optional()
    .isIn(['primary', 'fallback', 'ensemble'])
    .withMessage('Invalid model type'),
  body('options.confidenceThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence threshold must be between 0 and 1'),
  body('options.includeFeatureImportance')
    .optional()
    .isBoolean()
    .withMessage('includeFeatureImportance must be boolean'),
  body('options.includeClinicalInterpretation')
    .optional()
    .isBoolean()
    .withMessage('includeClinicalInterpretation must be boolean')
];

const batchScoringValidation = [
  body('featureSets')
    .isArray({ min: 1, max: 10 })
    .withMessage('featureSets must be an array with 1-10 items'),
  body('featureSets.*')
    .isObject()
    .withMessage('Each feature set must be an object'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object')
];

const comparisonValidation = [
  body('scoringIds')
    .isArray({ min: 2, max: 10 })
    .withMessage('scoringIds must be an array with 2-10 items'),
  body('scoringIds.*')
    .isUUID()
    .withMessage('Each scoring ID must be a valid UUID'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object')
];

const analysisIdValidation = [
  param('analysisId')
    .isUUID()
    .withMessage('Analysis ID must be a valid UUID')
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
 * @route   POST /api/cognitive-model/score
 * @desc    Score cognitive features using ML model
 * @access  Public (with rate limiting)
 * @body    {object} features - Cognitive features to score
 * @body    {object} [options] - Scoring options
 */
router.post(
  '/score',
  scoringLimiter,
  featureScoringValidation,
  cognitiveModelController.scoreFeatures
);

/**
 * @route   POST /api/cognitive-model/score-analysis/:analysisId
 * @desc    Score features from existing analysis
 * @access  Public (with rate limiting)
 * @params  {string} analysisId - Analysis UUID
 * @body    {object} [options] - Scoring options
 */
router.post(
  '/score-analysis/:analysisId',
  scoringLimiter,
  analysisIdValidation,
  body('options').optional().isObject(),
  cognitiveModelController.scoreAnalysis
);

/**
 * @route   POST /api/cognitive-model/batch-score
 * @desc    Score multiple feature sets in batch
 * @access  Public (with rate limiting)
 * @body    {array} featureSets - Array of feature objects (max 10)
 * @body    {object} [options] - Scoring options
 */
router.post(
  '/batch-score',
  batchLimiter,
  batchScoringValidation,
  cognitiveModelController.batchScore
);

/**
 * @route   POST /api/cognitive-model/compare-scores
 * @desc    Compare multiple scoring results
 * @access  Public (with rate limiting)
 * @body    {array} scoringIds - Array of scoring UUIDs (2-10 items)
 * @body    {object} [options] - Comparison options
 */
router.post(
  '/compare-scores',
  scoringLimiter,
  comparisonValidation,
  cognitiveModelController.compareScores
);

/**
 * @route   GET /api/cognitive-model/health
 * @desc    Get model health and status
 * @access  Public
 */
router.get(
  '/health',
  cognitiveModelController.getModelHealth
);

/**
 * @route   GET /api/cognitive-model/capabilities
 * @desc    Get model capabilities and metadata
 * @access  Public
 */
router.get(
  '/capabilities',
  cognitiveModelController.getCapabilities
);

/**
 * @route   GET /api/cognitive-model/stats
 * @desc    Get scoring statistics
 * @access  Public
 * @query   {string} [dateFrom] - Filter from date (ISO string)
 * @query   {string} [dateTo] - Filter to date (ISO string)
 */
router.get(
  '/stats',
  statsValidation,
  cognitiveModelController.getStats
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Cognitive Model API Error:', error);
  
  // Handle specific error types
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      message: 'The requested model or data file could not be found'
    });
  }
  
  if (error.code === 'EACCES') {
    return res.status(403).json({
      success: false,
      error: 'Permission denied',
      message: 'Access to the model or data is denied'
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
      message: 'Model scoring request timed out. Please try again.'
    });
  }

  if (error.message && error.message.includes('Model scoring failed')) {
    return res.status(503).json({
      success: false,
      error: 'Model service unavailable',
      message: 'The ML model service is currently unavailable. Please try again later.'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred during model scoring',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

module.exports = router;
