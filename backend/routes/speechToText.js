const express = require('express');
const rateLimit = require('express-rate-limit');
const speechToTextController = require('../controllers/speechToTextController');
const fileUploadMiddleware = require('../middleware/fileUpload');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting configurations
const transcriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 transcription requests per windowMs
  message: {
    error: 'Too many transcription requests',
    message: 'Please wait before making another transcription request',
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

// Apply general rate limiting to all routes
router.use(generalLimiter);

/**
 * @route   POST /api/speech-to-text/transcribe
 * @desc    Upload audio file and get transcription
 * @access  Public (with rate limiting)
 * @body    {file} audio - Audio file to transcribe
 * @body    {string} [language] - Language code (optional)
 * @body    {string} [model] - Whisper model to use (optional)
 * @body    {boolean} [enhanceAudio] - Apply audio enhancement (optional)
 * @body    {string} [responseFormat] - Response format (optional)
 * @body    {number} [temperature] - Randomness (0-1, optional)
 */
router.post(
  '/transcribe',
  transcriptionLimiter,
  fileUploadMiddleware.uploadSingle(),
  fileUploadMiddleware.getFileInfo(),
  fileUploadMiddleware.validateTranscriptionRequest(),
  fileUploadMiddleware.cleanupFiles(),
  speechToTextController.transcribeAudio
);

/**
 * @route   GET /api/speech-to-text/transcriptions/:id
 * @desc    Get transcription by ID
 * @access  Public
 * @params  {string} id - Transcription ID
 */
router.get(
  '/transcriptions/:id',
  speechToTextController.getTranscription
);

/**
 * @route   GET /api/speech-to-text/transcriptions
 * @desc    Get all transcriptions with pagination and filtering
 * @access  Public
 * @query   {number} [page=1] - Page number
 * @query   {number} [limit=10] - Items per page (max 100)
 * @query   {string} [status] - Filter by status (completed, failed)
 * @query   {string} [dateFrom] - Filter from date (ISO string)
 * @query   {string} [dateTo] - Filter to date (ISO string)
 */
router.get(
  '/transcriptions',
  speechToTextController.getTranscriptions
);

/**
 * @route   DELETE /api/speech-to-text/transcriptions/:id
 * @desc    Delete transcription by ID
 * @access  Protected (Admin only)
 * @params  {string} id - Transcription ID
 */
router.delete(
  '/transcriptions/:id',
  authenticateToken,
  speechToTextController.deleteTranscription
);

/**
 * @route   GET /api/speech-to-text/transcriptions/:id/export
 * @desc    Export transcription as file
 * @access  Public
 * @params  {string} id - Transcription ID
 * @query   {string} [format=txt] - Export format (txt, json, srt, vtt)
 */
router.get(
  '/transcriptions/:id/export',
  speechToTextController.exportTranscription
);

/**
 * @route   GET /api/speech-to-text/stats
 * @desc    Get transcription statistics
 * @access  Public
 * @query   {string} [dateFrom] - Filter from date (ISO string)
 * @query   {string} [dateTo] - Filter to date (ISO string)
 */
router.get(
  '/stats',
  speechToTextController.getStats
);

/**
 * @route   GET /api/speech-to-text/health
 * @desc    Get service health status
 * @access  Public
 */
router.get(
  '/health',
  speechToTextController.getHealth
);

/**
 * @route   GET /api/speech-to-text/formats
 * @desc    Get supported audio formats and limits
 * @access  Public
 */
router.get(
  '/formats',
  speechToTextController.getSupportedFormats
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Speech-to-Text API Error:', error);
  
  // Handle specific error types
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'File not found',
      message: 'The requested file could not be found'
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
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

module.exports = router;
