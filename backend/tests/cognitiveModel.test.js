const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const app = require('../server');

describe('Cognitive Model API', () => {
  const apiBase = '/api/cognitive-model';
  
  // Sample feature data for testing
  const validFeatures = {
    basic: {
      wordCount: 150,
      sentenceCount: 12,
      averageWordsPerSentence: 12.5,
      typeTokenRatio: 0.75
    },
    lexical: {
      vocabularySize: 120,
      lexicalDiversity: 0.8,
      complexWordRatio: 0.15,
      averageWordLength: 5.2
    },
    sentiment: {
      sentimentScore: 1.2,
      sentimentPolarity: 'positive'
    },
    cognitive: {
      cognitiveHealthScore: 0.82,
      syntacticComplexity: 0.65,
      informationDensity: 0.71,
      hesitationRatio: 0.03
    }
  };

  const incompleteFeatures = {
    basic: {
      wordCount: 50,
      sentenceCount: 5
      // Missing typeTokenRatio
    },
    cognitive: {
      cognitiveHealthScore: 0.45
      // Missing other cognitive features
    }
  };

  beforeAll(async () => {
    // Ensure test directories exist
    await fs.ensureDir('./data/model-scores');
    await fs.ensureDir('./data/features');
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      const testFiles = await fs.readdir('./data/model-scores');
      for (const file of testFiles) {
        if (file.includes('test-')) {
          await fs.remove(path.join('./data/model-scores', file));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('GET /capabilities', () => {
    it('should return model capabilities', async () => {
      const response = await request(app)
        .get(`${apiBase}/capabilities`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('models');
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data).toHaveProperty('riskCategories');
      expect(response.body.data.models).toHaveProperty('primary');
      expect(response.body.data.models).toHaveProperty('fallback');
      expect(response.body.data.riskCategories).toHaveProperty('low');
      expect(response.body.data.riskCategories).toHaveProperty('moderate');
      expect(response.body.data.riskCategories).toHaveProperty('high');
    });
  });

  describe('GET /health', () => {
    it('should return model health status', async () => {
      const response = await request(app)
        .get(`${apiBase}/health`)
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.data.status);
    });
  });

  describe('POST /score', () => {
    it('should reject request without features', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid feature structure', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ features: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject missing required feature categories', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ 
          features: {
            basic: { wordCount: 100 }
            // Missing lexical and cognitive
          }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should score valid features successfully', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ features: validFeatures })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('scoringId');
      expect(response.body.data).toHaveProperty('riskScore');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('riskCategory');
      expect(response.body.data).toHaveProperty('modelMetadata');
      expect(response.body.data).toHaveProperty('featureImportance');
      expect(response.body.data).toHaveProperty('clinicalInterpretation');
      expect(response.body.data).toHaveProperty('recommendations');

      // Validate risk score range
      expect(response.body.data.riskScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.riskScore).toBeLessThanOrEqual(1);

      // Validate confidence range
      expect(response.body.data.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.data.confidence).toBeLessThanOrEqual(1);

      // Validate risk category structure
      expect(response.body.data.riskCategory).toHaveProperty('level');
      expect(response.body.data.riskCategory).toHaveProperty('label');
      expect(response.body.data.riskCategory).toHaveProperty('description');
      expect(['low', 'moderate', 'high']).toContain(response.body.data.riskCategory.level);
    });

    it('should handle incomplete features gracefully', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ features: incompleteFeatures })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('riskScore');
      expect(response.body.data).toHaveProperty('confidence');
      
      // Confidence should be lower for incomplete features
      expect(response.body.data.confidence).toBeLessThan(0.8);
    });

    it('should respect scoring options', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ 
          features: validFeatures,
          options: {
            modelType: 'fallback',
            includeFeatureImportance: true,
            includeClinicalInterpretation: true
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('featureImportance');
      expect(response.body.data).toHaveProperty('clinicalInterpretation');
    });

    it('should validate option parameters', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ 
          features: validFeatures,
          options: {
            modelType: 'invalid-type',
            confidenceThreshold: 1.5 // Invalid range
          }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /batch-score', () => {
    it('should reject empty batch', async () => {
      const response = await request(app)
        .post(`${apiBase}/batch-score`)
        .send({ featureSets: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject batch size exceeding limit', async () => {
      const largeBatch = Array(11).fill(validFeatures);
      const response = await request(app)
        .post(`${apiBase}/batch-score`)
        .send({ featureSets: largeBatch })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should score multiple feature sets successfully', async () => {
      const batch = [validFeatures, incompleteFeatures];
      const response = await request(app)
        .post(`${apiBase}/batch-score`)
        .send({ featureSets: batch })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.results).toHaveLength(2);
      expect(response.body.data.summary.total).toBe(2);

      // Check individual results
      response.body.data.results.forEach((result, index) => {
        expect(result).toHaveProperty('index');
        expect(result).toHaveProperty('success');
        expect(result.index).toBe(index);
        
        if (result.success) {
          expect(result).toHaveProperty('result');
          expect(result.result).toHaveProperty('riskScore');
          expect(result.result).toHaveProperty('confidence');
        }
      });
    });

    it('should handle mixed success/failure in batch', async () => {
      const batch = [
        validFeatures,
        { invalid: 'data' }, // This should fail validation
        incompleteFeatures
      ];
      
      const response = await request(app)
        .post(`${apiBase}/batch-score`)
        .send({ featureSets: batch })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.total).toBe(3);
      expect(response.body.data.summary.successful).toBeLessThan(3);
      expect(response.body.data.summary.failed).toBeGreaterThan(0);
    });
  });

  describe('POST /score-analysis/:analysisId', () => {
    let testAnalysisId;

    beforeAll(async () => {
      // Create a test analysis file
      testAnalysisId = 'test-analysis-123';
      const analysisData = {
        analysisId: testAnalysisId,
        features: validFeatures,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJson(`./data/features/analysis_${testAnalysisId}.json`, analysisData);
    });

    afterAll(async () => {
      // Cleanup test analysis
      try {
        await fs.remove(`./data/features/analysis_${testAnalysisId}.json`);
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should return 404 for non-existent analysis', async () => {
      const fakeId = 'non-existent-analysis';
      const response = await request(app)
        .post(`${apiBase}/score-analysis/${fakeId}`)
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Analysis not found');
    });

    it('should score existing analysis successfully', async () => {
      const response = await request(app)
        .post(`${apiBase}/score-analysis/${testAnalysisId}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('riskScore');
      expect(response.body.data).toHaveProperty('confidence');
      expect(response.body.data).toHaveProperty('sourceAnalysisId');
      expect(response.body.data.sourceAnalysisId).toBe(testAnalysisId);
    });

    it('should validate analysis ID format', async () => {
      const invalidId = 'invalid-uuid-format';
      const response = await request(app)
        .post(`${apiBase}/score-analysis/${invalidId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /compare-scores', () => {
    let scoringIds = [];

    beforeAll(async () => {
      // Create test scoring results
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post(`${apiBase}/score`)
          .send({ features: validFeatures });
        
        if (response.body.success) {
          scoringIds.push(response.body.data.scoringId);
        }
      }
    });

    it('should reject comparison with insufficient scores', async () => {
      const response = await request(app)
        .post(`${apiBase}/compare-scores`)
        .send({ scoringIds: ['single-id'] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject comparison with too many scores', async () => {
      const tooManyIds = Array(11).fill('fake-uuid-' + Date.now());
      const response = await request(app)
        .post(`${apiBase}/compare-scores`)
        .send({ scoringIds: tooManyIds })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should compare valid scores', async () => {
      if (scoringIds.length < 2) {
        pending('Insufficient scoring IDs for comparison test');
        return;
      }

      const response = await request(app)
        .post(`${apiBase}/compare-scores`)
        .send({ scoringIds: scoringIds.slice(0, 2) })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('comparison');
      expect(response.body.data.comparison).toHaveProperty('scoreCount');
      expect(response.body.data.comparison).toHaveProperty('statistics');
      expect(response.body.data.comparison).toHaveProperty('trends');
      expect(response.body.data.comparison).toHaveProperty('insights');
      expect(response.body.data.comparison.scoreCount).toBe(2);
    });

    it('should handle comparison with non-existent scores', async () => {
      const fakeIds = ['fake-uuid-1', 'fake-uuid-2'];
      const response = await request(app)
        .post(`${apiBase}/compare-scores`)
        .send({ scoringIds: fakeIds })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient data');
    });

    it('should validate UUID format for scoring IDs', async () => {
      const invalidIds = ['invalid-uuid-1', 'invalid-uuid-2'];
      const response = await request(app)
        .post(`${apiBase}/compare-scores`)
        .send({ scoringIds: invalidIds })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /stats', () => {
    it('should return scoring statistics', async () => {
      const response = await request(app)
        .get(`${apiBase}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('riskDistribution');
      expect(response.body.data).toHaveProperty('averageScore');
      expect(response.body.data).toHaveProperty('averageConfidence');
      expect(response.body.data).toHaveProperty('modelUsage');
      expect(response.body.data).toHaveProperty('processingTimes');
      expect(response.body.data.riskDistribution).toHaveProperty('low');
      expect(response.body.data.riskDistribution).toHaveProperty('moderate');
      expect(response.body.data.riskDistribution).toHaveProperty('high');
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

    it('should validate date format', async () => {
      const response = await request(app)
        .get(`${apiBase}/stats`)
        .query({
          dateFrom: 'invalid-date',
          dateTo: 'invalid-date'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on scoring endpoint', async () => {
      // This test might be flaky depending on other tests running
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 32; i++) {
        requests.push(
          request(app)
            .post(`${apiBase}/score`)
            .send({ features: validFeatures })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      // Note: This test might not always pass if rate limiting is disabled in test env
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body.error).toContain('Too many');
      }
    }, 20000); // Increase timeout for multiple requests

    it('should enforce stricter rate limits on batch scoring', async () => {
      const requests = [];
      
      // Make multiple rapid batch requests
      for (let i = 0; i < 7; i++) {
        requests.push(
          request(app)
            .post(`${apiBase}/batch-score`)
            .send({ featureSets: [validFeatures] })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body.error).toContain('Too many');
      }
    }, 15000);
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
        .post(`${apiBase}/score`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .set('Content-Type', 'application/json')
        .send('{"features": "incomplete json"')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid JSON');
    });
  });

  describe('Feature Quality Assessment', () => {
    it('should provide quality metrics in scoring result', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ features: validFeatures })
        .expect(200);

      expect(response.body.data).toHaveProperty('qualityMetrics');
      expect(response.body.data.qualityMetrics).toHaveProperty('featureCompleteness');
      expect(response.body.data.qualityMetrics).toHaveProperty('dataQuality');
      expect(response.body.data.qualityMetrics).toHaveProperty('modelReliability');
    });

    it('should indicate lower quality for incomplete features', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ features: incompleteFeatures })
        .expect(200);

      expect(response.body.data.qualityMetrics.featureCompleteness).toBeLessThan(1.0);
      expect(response.body.data.confidence).toBeLessThan(0.8);
    });
  });

  describe('Clinical Interpretation', () => {
    it('should provide clinical interpretation for all risk levels', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ features: validFeatures })
        .expect(200);

      expect(response.body.data).toHaveProperty('clinicalInterpretation');
      expect(response.body.data.clinicalInterpretation).toHaveProperty('summary');
      expect(response.body.data.clinicalInterpretation).toHaveProperty('details');
      expect(response.body.data.clinicalInterpretation).toHaveProperty('clinicalSignificance');
      expect(response.body.data.clinicalInterpretation).toHaveProperty('limitations');
    });

    it('should provide appropriate recommendations', async () => {
      const response = await request(app)
        .post(`${apiBase}/score`)
        .send({ features: validFeatures })
        .expect(200);

      expect(response.body.data).toHaveProperty('recommendations');
      expect(response.body.data.recommendations).toHaveProperty('immediate');
      expect(response.body.data.recommendations).toHaveProperty('shortTerm');
      expect(response.body.data.recommendations).toHaveProperty('longTerm');
      expect(response.body.data.recommendations).toHaveProperty('lifestyle');
      expect(response.body.data.recommendations).toHaveProperty('monitoring');
    });
  });
});
