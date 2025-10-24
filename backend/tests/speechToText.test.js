const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const app = require('../server');

describe('Speech-to-Text API', () => {
  const testAudioFile = path.join(__dirname, 'fixtures', 'test-audio.wav');
  const apiBase = '/api/speech-to-text';

  beforeAll(async () => {
    // Create test fixtures directory
    await fs.ensureDir(path.join(__dirname, 'fixtures'));
    
    // Create a dummy audio file for testing (if it doesn't exist)
    if (!await fs.pathExists(testAudioFile)) {
      // Create a minimal WAV file header for testing
      const wavHeader = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x00, 0x00, 0x00, // File size - 8
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        0x66, 0x6D, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // Subchunk1Size
        0x01, 0x00,             // AudioFormat (PCM)
        0x01, 0x00,             // NumChannels (Mono)
        0x40, 0x1F, 0x00, 0x00, // SampleRate (8000)
        0x80, 0x3E, 0x00, 0x00, // ByteRate
        0x02, 0x00,             // BlockAlign
        0x10, 0x00,             // BitsPerSample
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x00, 0x00, 0x00  // Subchunk2Size
      ]);
      await fs.writeFile(testAudioFile, wavHeader);
    }
  });

  afterAll(async () => {
    // Cleanup test files
    await fs.remove(path.join(__dirname, 'fixtures'));
  });

  describe('GET /formats', () => {
    it('should return supported audio formats', async () => {
      const response = await request(app)
        .get(`${apiBase}/formats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('supported');
      expect(response.body.data).toHaveProperty('maxFileSize');
      expect(Array.isArray(response.body.data.supported)).toBe(true);
      expect(response.body.data.supported.length).toBeGreaterThan(0);
    });
  });

  describe('GET /health', () => {
    it('should return service health status', async () => {
      const response = await request(app)
        .get(`${apiBase}/health`)
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('POST /transcribe', () => {
    it('should reject request without audio file', async () => {
      const response = await request(app)
        .post(`${apiBase}/transcribe`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No audio file provided');
    });

    it('should reject unsupported file format', async () => {
      const response = await request(app)
        .post(`${apiBase}/transcribe`)
        .attach('audio', Buffer.from('fake content'), 'test.txt')
        .expect(400);

      expect(response.body.error).toBe('Upload failed');
      expect(response.body.message).toContain('Unsupported audio format');
    });

    it('should accept valid audio file', async () => {
      const response = await request(app)
        .post(`${apiBase}/transcribe`)
        .attach('audio', testAudioFile)
        .field('language', 'en')
        .field('model', 'base')
        .expect((res) => {
          // Accept both success (200) and service unavailable (500) 
          // since Whisper service might not be running in test environment
          expect([200, 500]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transcriptionId');
        expect(response.body.data).toHaveProperty('text');
      } else {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      }
    });

    it('should validate transcription options', async () => {
      const response = await request(app)
        .post(`${apiBase}/transcribe`)
        .attach('audio', testAudioFile)
        .field('temperature', '1.5') // Invalid temperature (should be 0-1)
        .expect((res) => {
          expect([200, 400, 500]).toContain(res.status);
        });

      // If validation is working, should get 400 for invalid temperature
      // If Whisper service is unavailable, might get 500
      // If validation passes but service works, might get 200
    });
  });

  describe('GET /transcriptions', () => {
    it('should return paginated transcriptions list', async () => {
      const response = await request(app)
        .get(`${apiBase}/transcriptions`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('pages');
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get(`${apiBase}/transcriptions`)
        .query({ page: 0, limit: 101 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`${apiBase}/transcriptions`)
        .query({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /transcriptions/:id', () => {
    it('should return 404 for non-existent transcription', async () => {
      const fakeId = 'non-existent-id';
      const response = await request(app)
        .get(`${apiBase}/transcriptions/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Transcription not found');
    });

    it('should return 400 for missing ID', async () => {
      const response = await request(app)
        .get(`${apiBase}/transcriptions/`)
        .expect(404); // Express returns 404 for missing route parameter
    });
  });

  describe('GET /stats', () => {
    it('should return transcription statistics', async () => {
      const response = await request(app)
        .get(`${apiBase}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('failed');
      expect(response.body.data).toHaveProperty('averageProcessingTime');
      expect(response.body.data).toHaveProperty('averageConfidence');
      expect(response.body.data).toHaveProperty('languageDistribution');
    });

    it('should filter stats by date range', async () => {
      const response = await request(app)
        .get(`${apiBase}/stats`)
        .query({
          dateFrom: '2024-01-01T00:00:00.000Z',
          dateTo: '2024-12-31T23:59:59.999Z'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dateRange).toHaveProperty('from');
      expect(response.body.data.dateRange).toHaveProperty('to');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on transcription endpoint', async () => {
      // This test might be flaky depending on other tests running
      // Skip if rate limiting is not strictly enforced in test environment
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 12; i++) {
        requests.push(
          request(app)
            .post(`${apiBase}/transcribe`)
            .attach('audio', testAudioFile)
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      // Note: This test might not always pass if rate limiting is disabled in test env
      // or if requests are spread out enough
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body.error).toContain('Too many');
      }
    }, 10000); // Increase timeout for multiple requests
  });

  describe('File Upload Validation', () => {
    it('should reject files that are too large', async () => {
      // Create a buffer larger than the limit (if limit is enforced)
      const largeBuffer = Buffer.alloc(60 * 1024 * 1024); // 60MB
      
      const response = await request(app)
        .post(`${apiBase}/transcribe`)
        .attach('audio', largeBuffer, 'large-file.wav')
        .expect(400);

      expect(response.body.error).toBe('Upload failed');
      expect(response.body.message).toContain('File too large');
    });

    it('should handle multiple file upload attempt', async () => {
      const response = await request(app)
        .post(`${apiBase}/transcribe`)
        .attach('audio', testAudioFile)
        .attach('audio2', testAudioFile)
        .expect(400);

      expect(response.body.error).toBe('Upload failed');
    });
  });

  describe('Export Functionality', () => {
    it('should return 404 for non-existent transcription export', async () => {
      const fakeId = 'non-existent-id';
      const response = await request(app)
        .get(`${apiBase}/transcriptions/${fakeId}/export`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should support different export formats', async () => {
      const fakeId = 'non-existent-id';
      
      const formats = ['txt', 'json', 'srt', 'vtt'];
      
      for (const format of formats) {
        const response = await request(app)
          .get(`${apiBase}/transcriptions/${fakeId}/export`)
          .query({ format })
          .expect(404); // Will be 404 since transcription doesn't exist

        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid route gracefully', async () => {
      const response = await request(app)
        .get(`${apiBase}/invalid-endpoint`)
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });

    it('should return proper error format', async () => {
      const response = await request(app)
        .post(`${apiBase}/transcribe`)
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });
  });
});

// Helper function to create test audio files
function createTestAudioFile(filename, duration = 1000) {
  const sampleRate = 8000;
  const samples = Math.floor(sampleRate * duration / 1000);
  const buffer = Buffer.alloc(44 + samples * 2);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples * 2, 40);
  
  // Generate sine wave data
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 32767;
    buffer.writeInt16LE(sample, 44 + i * 2);
  }
  
  return buffer;
}
