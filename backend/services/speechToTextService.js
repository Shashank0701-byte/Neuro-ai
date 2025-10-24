const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');

class SpeechToTextService {
  constructor() {
    this.whisperApiUrl = process.env.WHISPER_API_URL || 'http://localhost:8000';
    this.whisperApiKey = process.env.WHISPER_API_KEY;
    this.whisperModel = process.env.WHISPER_MODEL || 'base';
    this.transcriptionsDir = process.env.TRANSCRIPTIONS_DIR || './data/transcriptions';
    
    // Ensure transcriptions directory exists
    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      await fs.ensureDir(this.transcriptionsDir);
    } catch (error) {
      console.error('Error creating transcriptions directory:', error);
    }
  }

  /**
   * Process audio file and get transcription from Whisper
   * @param {string} audioFilePath - Path to the audio file
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(audioFilePath, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate file exists
      if (!await fs.pathExists(audioFilePath)) {
        throw new Error('Audio file not found');
      }

      // Get file info
      const fileStats = await fs.stat(audioFilePath);
      const fileInfo = {
        size: fileStats.size,
        path: audioFilePath,
        name: path.basename(audioFilePath)
      };

      // Preprocess audio if needed
      const processedAudioPath = await this.preprocessAudio(audioFilePath, options);

      // Send to Whisper API
      const transcriptionResult = await this.callWhisperAPI(processedAudioPath, options);

      // Calculate processing time
      const processingTime = (Date.now() - startTime) / 1000;

      // Create transcription record
      const transcription = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        fileInfo,
        options,
        result: transcriptionResult,
        processingTime,
        confidence: transcriptionResult.confidence || 0.95,
        status: 'completed'
      };

      // Save transcription to storage
      await this.saveTranscription(transcription);

      // Cleanup processed file if different from original
      if (processedAudioPath !== audioFilePath) {
        await fs.remove(processedAudioPath).catch(() => {});
      }

      return transcription;

    } catch (error) {
      console.error('Transcription error:', error);
      
      const errorResult = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        processingTime: (Date.now() - startTime) / 1000
      };

      return errorResult;
    }
  }

  /**
   * Preprocess audio file for optimal transcription
   * @param {string} inputPath - Original audio file path
   * @param {Object} options - Processing options
   * @returns {Promise<string>} Path to processed audio file
   */
  async preprocessAudio(inputPath, options = {}) {
    return new Promise((resolve, reject) => {
      const outputPath = inputPath.replace(path.extname(inputPath), '_processed.wav');
      
      // Skip preprocessing if file is already in optimal format
      if (path.extname(inputPath).toLowerCase() === '.wav' && !options.enhanceAudio) {
        return resolve(inputPath);
      }

      let command = ffmpeg(inputPath)
        .audioChannels(1) // Convert to mono
        .audioFrequency(16000) // 16kHz sample rate (optimal for Whisper)
        .audioCodec('pcm_s16le') // 16-bit PCM
        .format('wav');

      // Apply audio enhancements if requested
      if (options.enhanceAudio) {
        command = command
          .audioFilters([
            'highpass=f=80', // Remove low-frequency noise
            'lowpass=f=8000', // Remove high-frequency noise
            'volume=1.5' // Boost volume slightly
          ]);
      }

      command
        .output(outputPath)
        .on('end', () => {
          console.log('Audio preprocessing completed');
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('Audio preprocessing failed:', error);
          resolve(inputPath); // Fall back to original file
        })
        .run();
    });
  }

  /**
   * Call Whisper API for transcription
   * @param {string} audioFilePath - Path to audio file
   * @param {Object} options - API options
   * @returns {Promise<Object>} API response
   */
  async callWhisperAPI(audioFilePath, options = {}) {
    try {
      // Check if we're using local Whisper or API service
      if (this.whisperApiUrl.includes('localhost') || this.whisperApiUrl.includes('127.0.0.1')) {
        return await this.callLocalWhisper(audioFilePath, options);
      } else {
        return await this.callRemoteWhisperAPI(audioFilePath, options);
      }
    } catch (error) {
      console.error('Whisper API call failed:', error);
      throw new Error(`Transcription service unavailable: ${error.message}`);
    }
  }

  /**
   * Call local Whisper installation
   * @param {string} audioFilePath - Path to audio file
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Transcription result
   */
  async callLocalWhisper(audioFilePath, options = {}) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model', options.model || this.whisperModel);
    formData.append('response_format', 'verbose_json');
    
    if (options.language) {
      formData.append('language', options.language);
    }

    const response = await axios.post(`${this.whisperApiUrl}/v1/audio/transcriptions`, formData, {
      headers: {
        ...formData.getHeaders(),
        ...(this.whisperApiKey && { 'Authorization': `Bearer ${this.whisperApiKey}` })
      },
      timeout: 300000 // 5 minutes timeout
    });

    return this.parseWhisperResponse(response.data);
  }

  /**
   * Call remote Whisper API service (OpenAI, etc.)
   * @param {string} audioFilePath - Path to audio file
   * @param {Object} options - API options
   * @returns {Promise<Object>} Transcription result
   */
  async callRemoteWhisperAPI(audioFilePath, options = {}) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model', options.model || 'whisper-1');
    formData.append('response_format', 'verbose_json');
    
    if (options.language) {
      formData.append('language', options.language);
    }

    const response = await axios.post(`${this.whisperApiUrl}/v1/audio/transcriptions`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${this.whisperApiKey}`
      },
      timeout: 300000 // 5 minutes timeout
    });

    return this.parseWhisperResponse(response.data);
  }

  /**
   * Parse Whisper API response
   * @param {Object} data - Raw API response
   * @returns {Object} Parsed transcription result
   */
  parseWhisperResponse(data) {
    return {
      text: data.text || '',
      language: data.language || 'unknown',
      duration: data.duration || 0,
      confidence: this.calculateConfidence(data.segments || []),
      segments: data.segments || [],
      words: this.extractWords(data.segments || [])
    };
  }

  /**
   * Calculate overall confidence from segments
   * @param {Array} segments - Whisper segments
   * @returns {number} Average confidence score
   */
  calculateConfidence(segments) {
    if (!segments.length) return 0.95; // Default confidence
    
    const totalConfidence = segments.reduce((sum, segment) => {
      return sum + (segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.95);
    }, 0);
    
    return Math.min(totalConfidence / segments.length, 1.0);
  }

  /**
   * Extract word-level timestamps from segments
   * @param {Array} segments - Whisper segments
   * @returns {Array} Word-level data
   */
  extractWords(segments) {
    const words = [];
    
    segments.forEach(segment => {
      if (segment.words) {
        segment.words.forEach(word => {
          words.push({
            word: word.word,
            start: word.start,
            end: word.end,
            confidence: word.probability || 0.95
          });
        });
      }
    });
    
    return words;
  }

  /**
   * Save transcription to storage
   * @param {Object} transcription - Transcription data
   * @returns {Promise<void>}
   */
  async saveTranscription(transcription) {
    try {
      const filePath = path.join(this.transcriptionsDir, `${transcription.id}.json`);
      await fs.writeJson(filePath, transcription, { spaces: 2 });
      console.log(`Transcription saved: ${transcription.id}`);
    } catch (error) {
      console.error('Error saving transcription:', error);
    }
  }

  /**
   * Get transcription by ID
   * @param {string} transcriptionId - Transcription ID
   * @returns {Promise<Object|null>} Transcription data
   */
  async getTranscription(transcriptionId) {
    try {
      const filePath = path.join(this.transcriptionsDir, `${transcriptionId}.json`);
      
      if (await fs.pathExists(filePath)) {
        return await fs.readJson(filePath);
      }
      
      return null;
    } catch (error) {
      console.error('Error reading transcription:', error);
      return null;
    }
  }

  /**
   * Get all transcriptions (with pagination)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated transcriptions
   */
  async getTranscriptions(options = {}) {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo } = options;
      
      const files = await fs.readdir(this.transcriptionsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      let transcriptions = [];
      
      for (const file of jsonFiles) {
        try {
          const transcription = await fs.readJson(path.join(this.transcriptionsDir, file));
          
          // Apply filters
          if (status && transcription.status !== status) continue;
          if (dateFrom && new Date(transcription.timestamp) < new Date(dateFrom)) continue;
          if (dateTo && new Date(transcription.timestamp) > new Date(dateTo)) continue;
          
          transcriptions.push(transcription);
        } catch (error) {
          console.error(`Error reading transcription file ${file}:`, error);
        }
      }
      
      // Sort by timestamp (newest first)
      transcriptions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTranscriptions = transcriptions.slice(startIndex, endIndex);
      
      return {
        transcriptions: paginatedTranscriptions,
        pagination: {
          page,
          limit,
          total: transcriptions.length,
          pages: Math.ceil(transcriptions.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting transcriptions:', error);
      return { transcriptions: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
    }
  }

  /**
   * Delete transcription
   * @param {string} transcriptionId - Transcription ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTranscription(transcriptionId) {
    try {
      const filePath = path.join(this.transcriptionsDir, `${transcriptionId}.json`);
      
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        console.log(`Transcription deleted: ${transcriptionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting transcription:', error);
      return false;
    }
  }

  /**
   * Get service health status
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    try {
      // Test Whisper API connectivity
      const response = await axios.get(`${this.whisperApiUrl}/health`, {
        timeout: 5000,
        headers: this.whisperApiKey ? { 'Authorization': `Bearer ${this.whisperApiKey}` } : {}
      });
      
      return {
        status: 'healthy',
        whisperApi: 'connected',
        model: this.whisperModel,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'degraded',
        whisperApi: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new SpeechToTextService();
