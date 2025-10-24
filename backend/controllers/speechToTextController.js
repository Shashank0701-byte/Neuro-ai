const speechToTextService = require('../services/speechToTextService');
const fs = require('fs-extra');
const path = require('path');

class SpeechToTextController {
  /**
   * Upload and transcribe audio file
   * POST /api/speech-to-text/transcribe
   */
  async transcribeAudio(req, res) {
    try {
      const { audioFile, transcriptionOptions } = req;
      
      if (!audioFile) {
        return res.status(400).json({
          success: false,
          error: 'No audio file provided',
          message: 'Please upload an audio file'
        });
      }

      console.log(`Starting transcription for: ${audioFile.originalName}`);
      
      // Process transcription
      const result = await speechToTextService.transcribeAudio(
        audioFile.path,
        transcriptionOptions
      );

      // Check if transcription was successful
      if (result.status === 'failed') {
        return res.status(500).json({
          success: false,
          error: 'Transcription failed',
          message: result.error,
          transcriptionId: result.id
        });
      }

      // Return successful response
      res.status(200).json({
        success: true,
        message: 'Transcription completed successfully',
        data: {
          transcriptionId: result.id,
          text: result.result.text,
          language: result.result.language,
          confidence: result.confidence,
          duration: result.result.duration,
          processingTime: result.processingTime,
          wordCount: result.result.text.split(' ').length,
          segments: result.result.segments,
          words: result.result.words
        },
        metadata: {
          fileInfo: {
            originalName: audioFile.originalName,
            size: audioFile.size,
            formattedSize: audioFile.formattedSize,
            mimetype: audioFile.mimetype
          },
          options: transcriptionOptions,
          timestamp: result.timestamp
        }
      });

    } catch (error) {
      console.error('Transcription controller error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while processing the transcription',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get transcription by ID
   * GET /api/speech-to-text/transcriptions/:id
   */
  async getTranscription(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing transcription ID',
          message: 'Transcription ID is required'
        });
      }

      const transcription = await speechToTextService.getTranscription(id);
      
      if (!transcription) {
        return res.status(404).json({
          success: false,
          error: 'Transcription not found',
          message: `No transcription found with ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        data: transcription
      });

    } catch (error) {
      console.error('Get transcription error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while retrieving the transcription'
      });
    }
  }

  /**
   * Get all transcriptions with pagination
   * GET /api/speech-to-text/transcriptions
   */
  async getTranscriptions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        dateFrom,
        dateTo
      } = req.query;

      // Validate pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid page parameter',
          message: 'Page must be a positive integer'
        });
      }
      
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit parameter',
          message: 'Limit must be between 1 and 100'
        });
      }

      const options = {
        page: pageNum,
        limit: limitNum,
        status,
        dateFrom,
        dateTo
      };

      const result = await speechToTextService.getTranscriptions(options);
      
      res.status(200).json({
        success: true,
        data: result.transcriptions,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get transcriptions error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while retrieving transcriptions'
      });
    }
  }

  /**
   * Delete transcription by ID
   * DELETE /api/speech-to-text/transcriptions/:id
   */
  async deleteTranscription(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing transcription ID',
          message: 'Transcription ID is required'
        });
      }

      const deleted = await speechToTextService.deleteTranscription(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Transcription not found',
          message: `No transcription found with ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Transcription deleted successfully',
        transcriptionId: id
      });

    } catch (error) {
      console.error('Delete transcription error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while deleting the transcription'
      });
    }
  }

  /**
   * Get transcription statistics
   * GET /api/speech-to-text/stats
   */
  async getStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const options = { dateFrom, dateTo };
      const result = await speechToTextService.getTranscriptions(options);
      
      // Calculate statistics
      const stats = {
        total: result.pagination.total,
        completed: 0,
        failed: 0,
        averageProcessingTime: 0,
        averageConfidence: 0,
        totalDuration: 0,
        languageDistribution: {},
        dateRange: {
          from: dateFrom || 'all time',
          to: dateTo || 'now'
        }
      };

      let totalProcessingTime = 0;
      let totalConfidence = 0;
      let completedCount = 0;

      result.transcriptions.forEach(transcription => {
        if (transcription.status === 'completed') {
          stats.completed++;
          completedCount++;
          
          if (transcription.processingTime) {
            totalProcessingTime += transcription.processingTime;
          }
          
          if (transcription.confidence) {
            totalConfidence += transcription.confidence;
          }
          
          if (transcription.result && transcription.result.duration) {
            stats.totalDuration += transcription.result.duration;
          }
          
          if (transcription.result && transcription.result.language) {
            const lang = transcription.result.language;
            stats.languageDistribution[lang] = (stats.languageDistribution[lang] || 0) + 1;
          }
        } else if (transcription.status === 'failed') {
          stats.failed++;
        }
      });

      // Calculate averages
      if (completedCount > 0) {
        stats.averageProcessingTime = totalProcessingTime / completedCount;
        stats.averageConfidence = totalConfidence / completedCount;
      }

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get stats error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while calculating statistics'
      });
    }
  }

  /**
   * Export transcription as text file
   * GET /api/speech-to-text/transcriptions/:id/export
   */
  async exportTranscription(req, res) {
    try {
      const { id } = req.params;
      const { format = 'txt' } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing transcription ID',
          message: 'Transcription ID is required'
        });
      }

      const transcription = await speechToTextService.getTranscription(id);
      
      if (!transcription) {
        return res.status(404).json({
          success: false,
          error: 'Transcription not found',
          message: `No transcription found with ID: ${id}`
        });
      }

      if (transcription.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Transcription not completed',
          message: 'Cannot export incomplete transcription'
        });
      }

      const filename = `transcription-${id}.${format}`;
      
      // Set response headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', this.getContentType(format));
      
      // Generate export content based on format
      const content = this.generateExportContent(transcription, format);
      
      res.status(200).send(content);

    } catch (error) {
      console.error('Export transcription error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while exporting the transcription'
      });
    }
  }

  /**
   * Get service health status
   * GET /api/speech-to-text/health
   */
  async getHealth(req, res) {
    try {
      const health = await speechToTextService.getHealthStatus();
      
      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        success: health.status === 'healthy',
        data: health
      });

    } catch (error) {
      console.error('Health check error:', error);
      
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Health check failed'
      });
    }
  }

  /**
   * Get supported audio formats
   * GET /api/speech-to-text/formats
   */
  getSupportedFormats(req, res) {
    const formats = {
      supported: [
        { extension: '.mp3', mimetype: 'audio/mpeg', description: 'MP3 Audio' },
        { extension: '.wav', mimetype: 'audio/wav', description: 'WAV Audio' },
        { extension: '.m4a', mimetype: 'audio/mp4', description: 'M4A Audio' },
        { extension: '.aac', mimetype: 'audio/aac', description: 'AAC Audio' },
        { extension: '.ogg', mimetype: 'audio/ogg', description: 'OGG Audio' },
        { extension: '.webm', mimetype: 'audio/webm', description: 'WebM Audio' },
        { extension: '.flac', mimetype: 'audio/flac', description: 'FLAC Audio' },
        { extension: '.amr', mimetype: 'audio/amr', description: 'AMR Audio' },
        { extension: '.3gp', mimetype: 'audio/3gpp', description: '3GP Audio' }
      ],
      maxFileSize: process.env.UPLOAD_MAX_SIZE || 52428800,
      maxFileSizeFormatted: this.formatFileSize(process.env.UPLOAD_MAX_SIZE || 52428800)
    };

    res.status(200).json({
      success: true,
      data: formats
    });
  }

  // Helper methods
  getContentType(format) {
    const contentTypes = {
      'txt': 'text/plain',
      'json': 'application/json',
      'srt': 'text/plain',
      'vtt': 'text/vtt'
    };
    return contentTypes[format] || 'text/plain';
  }

  generateExportContent(transcription, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(transcription, null, 2);
      
      case 'srt':
        return this.generateSRT(transcription);
      
      case 'vtt':
        return this.generateVTT(transcription);
      
      case 'txt':
      default:
        return this.generateTXT(transcription);
    }
  }

  generateTXT(transcription) {
    let content = `Transcription Report\n`;
    content += `==================\n\n`;
    content += `ID: ${transcription.id}\n`;
    content += `Date: ${new Date(transcription.timestamp).toLocaleString()}\n`;
    content += `File: ${transcription.fileInfo.name}\n`;
    content += `Language: ${transcription.result.language}\n`;
    content += `Confidence: ${(transcription.confidence * 100).toFixed(1)}%\n`;
    content += `Duration: ${transcription.result.duration.toFixed(2)}s\n`;
    content += `Processing Time: ${transcription.processingTime.toFixed(2)}s\n\n`;
    content += `Transcription:\n`;
    content += `--------------\n`;
    content += transcription.result.text;
    return content;
  }

  generateSRT(transcription) {
    if (!transcription.result.segments) {
      return this.generateTXT(transcription);
    }

    let srt = '';
    transcription.result.segments.forEach((segment, index) => {
      srt += `${index + 1}\n`;
      srt += `${this.formatTime(segment.start)} --> ${this.formatTime(segment.end)}\n`;
      srt += `${segment.text.trim()}\n\n`;
    });
    return srt;
  }

  generateVTT(transcription) {
    if (!transcription.result.segments) {
      return this.generateTXT(transcription);
    }

    let vtt = 'WEBVTT\n\n';
    transcription.result.segments.forEach(segment => {
      vtt += `${this.formatTime(segment.start)} --> ${this.formatTime(segment.end)}\n`;
      vtt += `${segment.text.trim()}\n\n`;
    });
    return vtt;
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new SpeechToTextController();
