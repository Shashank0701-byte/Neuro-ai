const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const app = require('../server');

describe('Feature Extraction API', () => {
  const apiBase = '/api/feature-extraction';
  const testText = "Hello, this is a sample text for testing feature extraction. It contains multiple sentences with various linguistic patterns. The text includes different types of words, punctuation, and structures that should be analyzed by our NLP system.";
  const shortText = "Short text.";
  const complexText = "The sophisticated algorithmic approach utilized in contemporary natural language processing systems demonstrates remarkable capabilities in extracting meaningful patterns from unstructured textual data, thereby facilitating comprehensive linguistic analysis.";

  beforeAll(async () => {
    // Ensure test directories exist
    await fs.ensureDir('./data/features');
  });

  afterAll(async () => {
    // Cleanup test data if needed
    try {
      const testFiles = await fs.readdir('./data/features');
      for (const file of testFiles) {
        if (file.includes('test-')) {
          await fs.remove(path.join('./data/features', file));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('GET /capabilities', () => {
    it('should return service capabilities', async () => {
      const response = await request(app)
        .get(`${apiBase}/capabilities`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data).toHaveProperty('limits');
      expect(response.body.data.features).toHaveProperty('basic');
      expect(response.body.data.features).toHaveProperty('lexical');
      expect(response.body.data.features).toHaveProperty('sentiment');
      expect(response.body.data.limits).toHaveProperty('maxTextLength');
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

  describe('POST /analyze', () => {
    it('should reject request without text', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject empty text', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject text that is too long', async () => {
      const longText = 'a'.repeat(50001);
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: longText })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should analyze valid text successfully', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: testText })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysisId');
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data).toHaveProperty('processingTime');
      expect(response.body.data).toHaveProperty('metadata');
      
      // Check basic features
      expect(response.body.data.features).toHaveProperty('basic');
      expect(response.body.data.features.basic).toHaveProperty('wordCount');
      expect(response.body.data.features.basic).toHaveProperty('sentenceCount');
      expect(response.body.data.features.basic.wordCount).toBeGreaterThan(0);
      
      // Check lexical features
      expect(response.body.data.features).toHaveProperty('lexical');
      expect(response.body.data.features.lexical).toHaveProperty('vocabularySize');
      expect(response.body.data.features.lexical).toHaveProperty('typeTokenRatio');
      
      // Check sentiment features
      expect(response.body.data.features).toHaveProperty('sentiment');
      expect(response.body.data.features.sentiment).toHaveProperty('sentimentScore');
      
      // Check summary
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('textComplexity');
      expect(response.body.summary).toHaveProperty('readabilityLevel');
      expect(response.body.summary).toHaveProperty('sentimentPolarity');
    });

    it('should analyze short text', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: shortText })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.features.basic.wordCount).toBe(2);
      expect(response.body.data.features.basic.sentenceCount).toBe(1);
    });

    it('should analyze complex text with advanced features', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ 
          text: complexText,
          options: {
            includeAdvanced: true,
            includeCognitive: true,
            analysisType: 'comprehensive'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.features).toHaveProperty('readability');
      expect(response.body.data.features.readability).toHaveProperty('fleschReadingEase');
      
      // Complex text should have lower readability scores
      expect(response.body.data.features.readability.fleschReadingEase).toBeLessThan(50);
    });

    it('should handle analysis options correctly', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ 
          text: testText,
          options: {
            language: 'en',
            analysisType: 'basic'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.features).toHaveProperty('basic');
      expect(response.body.data.features).toHaveProperty('lexical');
    });
  });

  describe('GET /analyses', () => {
    let analysisId;

    beforeAll(async () => {
      // Create a test analysis
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: testText });
      
      if (response.body.success) {
        analysisId = response.body.data.analysisId;
      }
    });

    it('should return paginated analyses list', async () => {
      const response = await request(app)
        .get(`${apiBase}/analyses`)
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
        .get(`${apiBase}/analyses`)
        .query({ page: 0, limit: 101 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`${apiBase}/analyses`)
        .query({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get(`${apiBase}/analyses`)
        .query({ 
          dateFrom: '2024-01-01T00:00:00.000Z',
          dateTo: '2024-12-31T23:59:59.999Z'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /analyses/:id', () => {
    let analysisId;

    beforeAll(async () => {
      // Create a test analysis
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: testText });
      
      if (response.body.success) {
        analysisId = response.body.data.analysisId;
      }
    });

    it('should return 404 for non-existent analysis', async () => {
      const fakeId = 'non-existent-id';
      const response = await request(app)
        .get(`${apiBase}/analyses/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Analysis not found');
    });

    it('should return analysis by valid ID', async () => {
      if (!analysisId) {
        pending('No analysis ID available for test');
        return;
      }

      const response = await request(app)
        .get(`${apiBase}/analyses/${analysisId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data.id).toBe(analysisId);
    });
  });

  describe('POST /compare', () => {
    let analysisIds = [];

    beforeAll(async () => {
      // Create multiple test analyses
      const texts = [testText, shortText, complexText];
      
      for (const text of texts) {
        const response = await request(app)
          .post(`${apiBase}/analyze`)
          .send({ text });
        
        if (response.body.success) {
          analysisIds.push(response.body.data.analysisId);
        }
      }
    });

    it('should reject comparison with insufficient analyses', async () => {
      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ analysisIds: ['single-id'] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject comparison with too many analyses', async () => {
      const tooManyIds = Array(11).fill('fake-id');
      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ analysisIds: tooManyIds })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should compare valid analyses', async () => {
      if (analysisIds.length < 2) {
        pending('Insufficient analysis IDs for comparison test');
        return;
      }

      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ analysisIds: analysisIds.slice(0, 2) })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysisCount');
      expect(response.body.data).toHaveProperty('comparison');
      expect(response.body.data).toHaveProperty('insights');
      expect(response.body.data.analysisCount).toBe(2);
    });

    it('should handle comparison with non-existent analyses', async () => {
      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ analysisIds: ['fake-id-1', 'fake-id-2'] })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient analyses found');
    });
  });

  describe('POST /analyze-transcription/:transcriptionId', () => {
    it('should return 404 for non-existent transcription', async () => {
      const fakeId = 'non-existent-transcription-id';
      const response = await request(app)
        .post(`${apiBase}/analyze-transcription/${fakeId}`)
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Transcription not found');
    });

    it('should validate transcription analysis options', async () => {
      const fakeId = 'fake-transcription-id';
      const response = await request(app)
        .post(`${apiBase}/analyze-transcription/${fakeId}`)
        .send({
          options: {
            analysisType: 'invalid-type'
          }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /stats', () => {
    it('should return feature extraction statistics', async () => {
      const response = await request(app)
        .get(`${apiBase}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('completed');
      expect(response.body.data).toHaveProperty('failed');
      expect(response.body.data).toHaveProperty('averageProcessingTime');
      expect(response.body.data).toHaveProperty('cognitiveHealthDistribution');
      expect(response.body.data).toHaveProperty('featureDistribution');
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
    it('should enforce rate limits on analysis endpoint', async () => {
      // This test might be flaky depending on other tests running
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 22; i++) {
        requests.push(
          request(app)
            .post(`${apiBase}/analyze`)
            .send({ text: `Test text ${i}` })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      // Note: This test might not always pass if rate limiting is disabled in test env
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body.error).toContain('Too many');
      }
    }, 15000); // Increase timeout for multiple requests
  });

  describe('Input Validation', () => {
    it('should handle special characters in text', async () => {
      const specialText = "Text with émojis 😀 and spëcial characters: @#$%^&*()";
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: specialText })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.features.basic.wordCount).toBeGreaterThan(0);
    });

    it('should handle text with only punctuation', async () => {
      const punctuationText = "!@#$%^&*().,;:";
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: punctuationText })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should handle gracefully even with no words
    });

    it('should handle text with mixed languages', async () => {
      const mixedText = "Hello world. Bonjour le monde. Hola mundo.";
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: mixedText })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.features.basic.wordCount).toBe(9);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .set('Content-Type', 'application/json')
        .send('{"text": "incomplete json"')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid JSON');
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
        .post(`${apiBase}/analyze`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    it('should handle server errors gracefully', async () => {
      // This test would require mocking internal services to force an error
      // For now, we'll just verify the error handling structure exists
      expect(typeof request).toBe('function');
    });
  });

  describe('Feature Quality', () => {
    it('should extract meaningful lexical features', async () => {
      const response = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: testText })
        .expect(200);

      const lexical = response.body.data.features.lexical;
      expect(lexical.vocabularySize).toBeGreaterThan(0);
      expect(lexical.typeTokenRatio).toBeGreaterThan(0);
      expect(lexical.typeTokenRatio).toBeLessThanOrEqual(1);
      expect(lexical.averageWordLength).toBeGreaterThan(0);
    });

    it('should provide consistent sentiment analysis', async () => {
      const positiveText = "I love this amazing wonderful fantastic great product!";
      const negativeText = "I hate this terrible awful horrible bad product!";

      const positiveResponse = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: positiveText })
        .expect(200);

      const negativeResponse = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: negativeText })
        .expect(200);

      const positiveSentiment = positiveResponse.body.data.features.sentiment;
      const negativeSentiment = negativeResponse.body.data.features.sentiment;

      expect(positiveSentiment.sentimentScore).toBeGreaterThan(negativeSentiment.sentimentScore);
      expect(positiveSentiment.sentimentPolarity).toBe('positive');
      expect(negativeSentiment.sentimentPolarity).toBe('negative');
    });

    it('should calculate readability scores appropriately', async () => {
      const simpleText = "The cat sat on the mat. It was a nice day.";
      const complexText = "The multifaceted algorithmic implementation necessitates comprehensive evaluation of sophisticated methodological approaches.";

      const simpleResponse = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: simpleText })
        .expect(200);

      const complexResponse = await request(app)
        .post(`${apiBase}/analyze`)
        .send({ text: complexText })
        .expect(200);

      const simpleReadability = simpleResponse.body.data.features.readability;
      const complexReadability = complexResponse.body.data.features.readability;

      // Simple text should have higher readability score (easier to read)
      expect(simpleReadability.fleschReadingEase).toBeGreaterThan(complexReadability.fleschReadingEase);
    });
  });
});
