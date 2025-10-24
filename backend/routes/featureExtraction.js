const express = require('express');
const rateLimit = require('express-rate-limit');
const featureExtractionController = require('../controllers/featureExtractionController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Rate limiting configurations
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 analysis requests per windowMs
  message: {
    error: 'Too many analysis requests',
    message: 'Please wait before making another analysis request',
    retryAfter: 900 // 15 minutes in seconds
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
const textAnalysisSchema = Joi.object({
  text: Joi.string().min(1).max(50000).required(),
  options: Joi.object({
    includeAdvanced: Joi.boolean().optional(),
    includeCognitive: Joi.boolean().optional(),
    language: Joi.string().min(2).max(5).optional(),
    analysisType: Joi.string().valid('basic', 'comprehensive', 'cognitive').optional()
  }).optional()
});

const transcriptionAnalysisSchema = Joi.object({
  options: Joi.object({
    includeAdvanced: Joi.boolean().optional(),
    includeCognitive: Joi.boolean().optional(),
    analysisType: Joi.string().valid('basic', 'comprehensive', 'cognitive').optional()
  }).optional()
});

const compareAnalysesSchema = Joi.object({
  analysisIds: Joi.array().items(Joi.string().uuid()).min(2).max(10).required()
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

/**
 * @route   POST /api/feature-extraction/analyze
 * @desc    Extract features from text
 * @access  Public (with rate limiting)
 * @body    {string} text - Text to analyze (required, max 50,000 chars)
 * @body    {object} [options] - Analysis options
 * @body    {boolean} [options.includeAdvanced] - Include advanced NLP features
 * @body    {boolean} [options.includeCognitive] - Include cognitive analysis
 * @body    {string} [options.language] - Language code (e.g., 'en')
 * @body    {string} [options.analysisType] - Analysis type (basic, comprehensive, cognitive)
 */
router.post(
  '/analyze',
  analysisLimiter,
  validateBody(textAnalysisSchema),
  featureExtractionController.analyzeText
);

/**
 * @route   POST /api/feature-extraction/analyze-transcription/:transcriptionId
 * @desc    Extract features from existing transcription
 * @access  Public (with rate limiting)
 * @params  {string} transcriptionId - Transcription UUID
 * @body    {object} [options] - Analysis options
 */
router.post(
  '/analyze-transcription/:transcriptionId',
  analysisLimiter,
  validateBody(transcriptionAnalysisSchema),
  featureExtractionController.analyzeTranscription
);

/**
 * @route   GET /api/feature-extraction/analyses/:id
 * @desc    Get analysis by ID
 * @access  Public
 * @params  {string} id - Analysis UUID
 */
router.get(
  '/analyses/:id',
  featureExtractionController.getAnalysis
);

/**
 * @route   GET /api/feature-extraction/analyses
 * @desc    Get all analyses with pagination and filtering
 * @access  Public
 * @query   {number} [page=1] - Page number
 * @query   {number} [limit=10] - Items per page (max 100)
 * @query   {string} [status] - Filter by status (completed, failed, processing)
 * @query   {string} [dateFrom] - Filter from date (ISO string)
 * @query   {string} [dateTo] - Filter to date (ISO string)
 */
router.get(
  '/analyses',
  featureExtractionController.getAnalyses
);

/**
 * @route   DELETE /api/feature-extraction/analyses/:id
 * @desc    Delete analysis by ID
 * @access  Protected (Admin only)
 * @params  {string} id - Analysis UUID
 */
router.delete(
  '/analyses/:id',
  authenticateToken,
  featureExtractionController.deleteAnalysis
);

/**
 * @route   POST /api/feature-extraction/compare
 * @desc    Compare multiple analyses
 * @access  Public (with rate limiting)
 * @body    {array} analysisIds - Array of analysis UUIDs (2-10 items)
 */
router.post(
  '/compare',
  analysisLimiter,
  validateBody(compareAnalysesSchema),
  featureExtractionController.compareAnalyses
);

/**
 * @route   GET /api/feature-extraction/stats
 * @desc    Get feature extraction statistics
 * @access  Public
 * @query   {string} [dateFrom] - Filter from date (ISO string)
 * @query   {string} [dateTo] - Filter to date (ISO string)
 */
router.get(
  '/stats',
  featureExtractionController.getStats
);

/**
 * @route   GET /api/feature-extraction/health
 * @desc    Get service health status
 * @access  Public
 */
router.get(
  '/health',
  featureExtractionController.getHealth
);

/**
 * @route   GET /api/feature-extraction/capabilities
 * @desc    Get available features and service capabilities
 * @access  Public
 */
router.get(
  '/capabilities',
  featureExtractionController.getCapabilities
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Feature Extraction API Error:', error);
  
  // Handle specific error types
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
      message: 'The requested resource could not be found'
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
      message: 'Analysis request timed out. Please try again with shorter text.'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred during feature extraction',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

module.exports = router;
