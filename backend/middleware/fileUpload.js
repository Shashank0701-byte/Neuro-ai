const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Supported audio formats
const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',        // MP3
  'audio/wav',         // WAV
  'audio/wave',        // WAV (alternative)
  'audio/x-wav',       // WAV (alternative)
  'audio/mp4',         // M4A
  'audio/m4a',         // M4A
  'audio/aac',         // AAC
  'audio/ogg',         // OGG
  'audio/webm',        // WebM
  'audio/flac',        // FLAC
  'audio/x-flac',      // FLAC (alternative)
  'audio/amr',         // AMR
  'audio/3gpp'         // 3GP
];

// File extensions mapping
const AUDIO_EXTENSIONS = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
  '.flac': 'audio/flac',
  '.amr': 'audio/amr',
  '.3gp': 'audio/3gpp'
};

class FileUploadMiddleware {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.UPLOAD_MAX_SIZE) || 52428800; // 50MB default
    this.initializeUploadDir();
  }

  async initializeUploadDir() {
    try {
      await fs.ensureDir(this.uploadDir);
      await fs.ensureDir(path.join(this.uploadDir, 'temp'));
      await fs.ensureDir(path.join(this.uploadDir, 'processed'));
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  // Configure multer storage
  getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, 'temp');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const timestamp = Date.now();
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `${timestamp}-${uniqueId}${extension}`;
        
        // Store original filename and generated filename in request
        req.uploadInfo = {
          originalName: file.originalname,
          filename: filename,
          uploadId: uniqueId,
          timestamp: timestamp
        };
        
        cb(null, filename);
      }
    });
  }

  // File filter function
  fileFilter(req, file, cb) {
    try {
      const extension = path.extname(file.originalname).toLowerCase();
      const mimeType = file.mimetype.toLowerCase();
      
      // Check by MIME type first
      if (SUPPORTED_AUDIO_FORMATS.includes(mimeType)) {
        return cb(null, true);
      }
      
      // Check by file extension if MIME type is generic
      if (mimeType === 'application/octet-stream' && AUDIO_EXTENSIONS[extension]) {
        // Override MIME type based on extension
        file.mimetype = AUDIO_EXTENSIONS[extension];
        return cb(null, true);
      }
      
      // Reject unsupported files
      const error = new Error(`Unsupported audio format. Supported formats: ${Object.keys(AUDIO_EXTENSIONS).join(', ')}`);
      error.code = 'UNSUPPORTED_FORMAT';
      cb(error, false);
      
    } catch (error) {
      cb(error, false);
    }
  }

  // Create multer instance
  createUploader() {
    return multer({
      storage: this.getStorage(),
      fileFilter: this.fileFilter.bind(this),
      limits: {
        fileSize: this.maxFileSize,
        files: 1 // Only allow single file upload
      }
    });
  }

  // Middleware for single file upload
  uploadSingle() {
    const upload = this.createUploader();
    
    return (req, res, next) => {
      upload.single('audio')(req, res, (error) => {
        if (error) {
          return this.handleUploadError(error, req, res, next);
        }
        
        // Validate uploaded file
        if (!req.file) {
          return res.status(400).json({
            error: 'No audio file provided',
            message: 'Please upload an audio file'
          });
        }
        
        // Add file metadata to request
        req.audioFile = {
          ...req.uploadInfo,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
          uploadedAt: new Date().toISOString()
        };
        
        console.log(`Audio file uploaded: ${req.audioFile.filename} (${this.formatFileSize(req.file.size)})`);
        next();
      });
    };
  }

  // Handle upload errors
  handleUploadError(error, req, res, next) {
    console.error('File upload error:', error);
    
    // Clean up any partially uploaded files
    if (req.file && req.file.path) {
      fs.remove(req.file.path).catch(() => {});
    }
    
    let statusCode = 400;
    let message = 'File upload failed';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size is ${this.formatFileSize(this.maxFileSize)}`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Only one file allowed';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name. Use "audio" field for file upload';
        break;
      case 'UNSUPPORTED_FORMAT':
        message = error.message;
        break;
      case 'ENOENT':
        statusCode = 500;
        message = 'Upload directory not accessible';
        break;
      default:
        if (error.message) {
          message = error.message;
        }
    }
    
    res.status(statusCode).json({
      error: 'Upload failed',
      message: message,
      code: error.code
    });
  }

  // Validation middleware for transcription requests
  validateTranscriptionRequest() {
    return (req, res, next) => {
      try {
        // Validate required audio file
        if (!req.audioFile) {
          return res.status(400).json({
            error: 'Missing audio file',
            message: 'Audio file is required for transcription'
          });
        }
        
        // Validate file size (additional check)
        if (req.audioFile.size > this.maxFileSize) {
          return res.status(400).json({
            error: 'File too large',
            message: `File size exceeds maximum limit of ${this.formatFileSize(this.maxFileSize)}`
          });
        }
        
        // Validate file exists on disk
        if (!fs.existsSync(req.audioFile.path)) {
          return res.status(400).json({
            error: 'File not found',
            message: 'Uploaded file is no longer available'
          });
        }
        
        // Parse and validate optional parameters
        const options = this.parseTranscriptionOptions(req.body);
        req.transcriptionOptions = options;
        
        next();
      } catch (error) {
        console.error('Transcription request validation error:', error);
        res.status(400).json({
          error: 'Invalid request',
          message: error.message
        });
      }
    };
  }

  // Parse transcription options from request body
  parseTranscriptionOptions(body) {
    const options = {};
    
    // Language option
    if (body.language && typeof body.language === 'string') {
      options.language = body.language.toLowerCase();
    }
    
    // Model option
    if (body.model && typeof body.model === 'string') {
      options.model = body.model;
    }
    
    // Audio enhancement option
    if (body.enhanceAudio !== undefined) {
      options.enhanceAudio = body.enhanceAudio === 'true' || body.enhanceAudio === true;
    }
    
    // Response format option
    if (body.responseFormat && typeof body.responseFormat === 'string') {
      options.responseFormat = body.responseFormat;
    }
    
    // Temperature for randomness (0-1)
    if (body.temperature !== undefined) {
      const temp = parseFloat(body.temperature);
      if (!isNaN(temp) && temp >= 0 && temp <= 1) {
        options.temperature = temp;
      }
    }
    
    return options;
  }

  // Cleanup middleware - removes uploaded files after processing
  cleanupFiles() {
    return async (req, res, next) => {
      // Store original end function
      const originalEnd = res.end;
      
      // Override end function to cleanup files
      res.end = async function(...args) {
        try {
          // Cleanup uploaded file
          if (req.audioFile && req.audioFile.path) {
            await fs.remove(req.audioFile.path);
            console.log(`Cleaned up uploaded file: ${req.audioFile.filename}`);
          }
          
          // Cleanup any temporary processed files
          if (req.processedFiles) {
            for (const filePath of req.processedFiles) {
              await fs.remove(filePath).catch(() => {});
            }
          }
        } catch (error) {
          console.error('Error cleaning up files:', error);
        }
        
        // Call original end function
        originalEnd.apply(this, args);
      };
      
      next();
    };
  }

  // Utility function to format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file info middleware
  getFileInfo() {
    return (req, res, next) => {
      if (req.audioFile) {
        req.audioFile.formattedSize = this.formatFileSize(req.audioFile.size);
        req.audioFile.extension = path.extname(req.audioFile.originalName).toLowerCase();
      }
      next();
    };
  }
}

// Export singleton instance
module.exports = new FileUploadMiddleware();
