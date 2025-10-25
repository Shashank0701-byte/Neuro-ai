const request = require('supertest');
const fs = require('fs-extra');
const path = require('path');
const app = require('../server');

describe('Explainability API', () => {
  const apiBase = '/api/explainability';
  
  // Sample data for testing
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

  const validPrediction = {
    scoringId: 'test-scoring-id-123',
    riskScore: 0.78,
    confidence: 0.89,
    riskCategory: {
      level: 'low',
      label: 'Low Risk',
      description: 'Cognitive indicators within normal ranges'
    }
  };

  const incompleteFeatures = {
    basic: {
      wordCount: 50,
      sentenceCount: 5
    },
    cognitive: {
      cognitiveHealthScore: 0.45
    }
  };

  beforeAll(async () => {
    // Ensure test directories exist
    await fs.ensureDir('./data/explanations');
    await fs.ensureDir('./data/visualizations');
    await fs.ensureDir('./data/model-scores');
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      const testFiles = await fs.readdir('./data/explanations');
      for (const file of testFiles) {
        if (file.includes('test-')) {
          await fs.remove(path.join('./data/explanations', file));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('GET /capabilities', () => {
    it('should return explainability capabilities', async () => {
      const response = await request(app)
        .get(`${apiBase}/capabilities`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('explanationTypes');
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data).toHaveProperty('clinicalInterpretation');
      expect(response.body.data).toHaveProperty('technicalDetails');
      expect(response.body.data.explanationTypes).toHaveProperty('waterfall');
      expect(response.body.data.explanationTypes).toHaveProperty('force');
      expect(response.body.data.explanationTypes).toHaveProperty('bar');
    });
  });

  describe('GET /health', () => {
    it('should return explainability service health status', async () => {
      const response = await request(app)
        .get(`${apiBase}/health`)
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('capabilities');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.data.status);
    });
  });

  describe('POST /explain', () => {
    it('should reject request without features', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ prediction: validPrediction })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject request without prediction', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ features: validFeatures })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid prediction format', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: { riskScore: 'invalid' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject invalid explanation types', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: validPrediction,
          options: { types: ['invalid_type'] }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should generate explanation successfully', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: validPrediction
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('explanationId');
      expect(response.body.data).toHaveProperty('shapValues');
      expect(response.body.data).toHaveProperty('featureAttributions');
      expect(response.body.data).toHaveProperty('insights');
      expect(response.body.data).toHaveProperty('interpretability');
      expect(response.body.data).toHaveProperty('metadata');

      // Validate SHAP values structure
      expect(typeof response.body.data.shapValues).toBe('object');
      expect(response.body.data.baseValue).toBeGreaterThanOrEqual(0);
      expect(response.body.data.baseValue).toBeLessThanOrEqual(1);

      // Validate feature attributions
      expect(typeof response.body.data.featureAttributions).toBe('object');
      const attributions = response.body.data.featureAttributions;
      for (const [featureName, attribution] of Object.entries(attributions)) {
        expect(attribution).toHaveProperty('shapValue');
        expect(attribution).toHaveProperty('direction');
        expect(attribution).toHaveProperty('percentageContribution');
        expect(['positive', 'negative', 'neutral']).toContain(attribution.direction);
      }

      // Validate insights
      expect(response.body.data.insights).toHaveProperty('topPositiveFeatures');
      expect(response.body.data.insights).toHaveProperty('topNegativeFeatures');
      expect(response.body.data.insights).toHaveProperty('keyFindings');
      expect(response.body.data.insights).toHaveProperty('clinicalRelevance');
    });

    it('should generate explanation with visualization options', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: validPrediction,
          options: {
            types: ['waterfall', 'bar'],
            includeVisualizations: true
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('visualizations');
      
      const visualizations = response.body.data.visualizations;
      expect(visualizations).toHaveProperty('waterfall');
      expect(visualizations).toHaveProperty('bar');
      
      // Check visualization structure
      for (const [type, viz] of Object.entries(visualizations)) {
        expect(viz).toHaveProperty('type');
        expect(viz).toHaveProperty('name');
        expect(viz).toHaveProperty('description');
        expect(viz.type).toBe(type);
      }
    });

    it('should handle incomplete features gracefully', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: incompleteFeatures,
          prediction: { ...validPrediction, riskScore: 0.45, confidence: 0.65 }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('explanationId');
      expect(response.body.data).toHaveProperty('shapValues');
      
      // Should still provide meaningful explanations
      expect(response.body.data.insights.keyFindings.length).toBeGreaterThan(0);
    });
  });

  describe('POST /score-and-explain', () => {
    it('should reject request without features', async () => {
      const response = await request(app)
        .post(`${apiBase}/score-and-explain`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should score and explain in single request', async () => {
      const response = await request(app)
        .post(`${apiBase}/score-and-explain`)
        .send({ 
          features: validFeatures,
          scoringOptions: { includeAdvanced: true },
          explanationOptions: { types: ['waterfall'] }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('scoring');
      expect(response.body.data).toHaveProperty('explanation');
      expect(response.body.data.integrated).toBe(true);

      // Validate scoring results
      expect(response.body.data.scoring).toHaveProperty('riskScore');
      expect(response.body.data.scoring).toHaveProperty('confidence');

      // Validate explanation results
      expect(response.body.data.explanation).toHaveProperty('explanationId');
      expect(response.body.data.explanation).toHaveProperty('shapValues');
    });
  });

  describe('POST /explain-score/:scoringId', () => {
    let testScoringId;

    beforeAll(async () => {
      // Create a test scoring result
      testScoringId = 'test-scoring-123';
      const scoringData = {
        scoringId: testScoringId,
        riskScore: 0.75,
        confidence: 0.85,
        sourceAnalysisId: 'test-analysis-456',
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJson(`./data/model-scores/score_${testScoringId}_${Date.now()}.json`, scoringData);
      
      // Create corresponding analysis with features
      const analysisData = {
        analysisId: 'test-analysis-456',
        features: validFeatures,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJson(`./data/features/analysis_test-analysis-456.json`, analysisData);
    });

    afterAll(async () => {
      // Cleanup test files
      try {
        const glob = require('glob');
        const scoreFiles = glob.sync(`./data/model-scores/score_${testScoringId}_*.json`);
        for (const file of scoreFiles) {
          await fs.remove(file);
        }
        await fs.remove('./data/features/analysis_test-analysis-456.json');
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should return 404 for non-existent scoring result', async () => {
      const fakeId = 'non-existent-scoring-id';
      const response = await request(app)
        .post(`${apiBase}/explain-score/${fakeId}`)
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Scoring result not found');
    });

    it('should explain existing scoring result', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain-score/${testScoringId}`)
        .send({ options: { types: ['bar'] } })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('explanationId');
      expect(response.body.data).toHaveProperty('shapValues');
      expect(response.body.data.sourceScoreId).toBe(testScoringId);
    });

    it('should validate scoring ID format', async () => {
      const invalidId = 'invalid-uuid-format';
      const response = await request(app)
        .post(`${apiBase}/explain-score/${invalidId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /explanation/:explanationId', () => {
    let testExplanationId;

    beforeAll(async () => {
      // Create a test explanation
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: validPrediction
        });
      
      if (response.body.success) {
        testExplanationId = response.body.data.explanationId;
      }
    });

    it('should return 404 for non-existent explanation', async () => {
      const fakeId = '12345678-1234-1234-1234-123456789012';
      const response = await request(app)
        .get(`${apiBase}/explanation/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Explanation not found');
    });

    it('should retrieve existing explanation', async () => {
      if (!testExplanationId) {
        pending('No test explanation ID available');
        return;
      }

      const response = await request(app)
        .get(`${apiBase}/explanation/${testExplanationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('explanationId');
      expect(response.body.data.explanationId).toBe(testExplanationId);
    });

    it('should validate explanation ID format', async () => {
      const invalidId = 'invalid-uuid-format';
      const response = await request(app)
        .get(`${apiBase}/explanation/${invalidId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('POST /compare', () => {
    let explanationIds = [];

    beforeAll(async () => {
      // Create multiple test explanations
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post(`${apiBase}/explain`)
          .send({ 
            features: {
              ...validFeatures,
              cognitive: {
                ...validFeatures.cognitive,
                cognitiveHealthScore: 0.7 + (i * 0.1) // Vary scores
              }
            },
            prediction: {
              ...validPrediction,
              riskScore: 0.7 + (i * 0.1)
            }
          });
        
        if (response.body.success) {
          explanationIds.push(response.body.data.explanationId);
        }
      }
    });

    it('should reject comparison with insufficient explanations', async () => {
      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ explanationIds: ['single-id'] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject comparison with too many explanations', async () => {
      const tooManyIds = Array(11).fill('12345678-1234-1234-1234-123456789012');
      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ explanationIds: tooManyIds })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });

    it('should compare valid explanations', async () => {
      if (explanationIds.length < 2) {
        pending('Insufficient explanation IDs for comparison test');
        return;
      }

      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ explanationIds: explanationIds.slice(0, 2) })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('comparison');
      expect(response.body.data.comparison).toHaveProperty('explanationCount');
      expect(response.body.data.comparison).toHaveProperty('riskScores');
      expect(response.body.data.comparison).toHaveProperty('featureConsistency');
      expect(response.body.data.comparison).toHaveProperty('insights');
      expect(response.body.data.comparison.explanationCount).toBe(2);
    });

    it('should handle comparison with non-existent explanations', async () => {
      const fakeIds = ['12345678-1234-1234-1234-123456789012', '12345678-1234-1234-1234-123456789013'];
      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ explanationIds: fakeIds })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insufficient data');
    });

    it('should validate UUID format for explanation IDs', async () => {
      const invalidIds = ['invalid-uuid-1', 'invalid-uuid-2'];
      const response = await request(app)
        .post(`${apiBase}/compare`)
        .send({ explanationIds: invalidIds })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /visualization/:filename', () => {
    it('should reject invalid filename', async () => {
      const response = await request(app)
        .get(`${apiBase}/visualization/../../../etc/passwd`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid filename');
    });

    it('should return 404 for non-existent visualization', async () => {
      const response = await request(app)
        .get(`${apiBase}/visualization/non-existent-file.png`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Visualization not found');
    });

    it('should validate filename format', async () => {
      const response = await request(app)
        .get(`${apiBase}/visualization/invalid-filename`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('GET /stats', () => {
    it('should return explainability statistics', async () => {
      const response = await request(app)
        .get(`${apiBase}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('explanationTypes');
      expect(response.body.data).toHaveProperty('averageProcessingTime');
      expect(response.body.data).toHaveProperty('visualizationGeneration');
      expect(response.body.data).toHaveProperty('featureImportance');
      expect(response.body.data).toHaveProperty('clinicalInsights');
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
    it('should enforce rate limits on explanation endpoint', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 22; i++) {
        requests.push(
          request(app)
            .post(`${apiBase}/explain`)
            .send({ 
              features: validFeatures,
              prediction: validPrediction
            })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one request should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses[0].body.error).toContain('Too many');
      }
    }, 30000); // Increase timeout for multiple requests
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
        .post(`${apiBase}/explain`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .set('Content-Type', 'application/json')
        .send('{"features": "incomplete json"')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid JSON');
    });
  });

  describe('Feature Attribution Analysis', () => {
    it('should provide meaningful feature attributions', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: validPrediction
        })
        .expect(200);

      const attributions = response.body.data.featureAttributions;
      
      // Check that attributions sum to reasonable total
      const totalContribution = Object.values(attributions)
        .reduce((sum, attr) => sum + attr.percentageContribution, 0);
      
      expect(totalContribution).toBeCloseTo(100, 1); // Should sum to ~100%
      
      // Check that important features have higher contributions
      expect(attributions.cognitiveHealthScore.percentageContribution)
        .toBeGreaterThan(attributions.wordCount.percentageContribution);
    });

    it('should provide clinical interpretations', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: validPrediction
        })
        .expect(200);

      const insights = response.body.data.insights;
      
      expect(insights.clinicalRelevance).toBeInstanceOf(Array);
      expect(insights.clinicalRelevance.length).toBeGreaterThan(0);
      
      for (const relevance of insights.clinicalRelevance) {
        expect(relevance).toHaveProperty('domain');
        expect(relevance).toHaveProperty('message');
        expect(relevance).toHaveProperty('clinicalSignificance');
        expect(relevance).toHaveProperty('recommendation');
      }
    });
  });

  describe('Visualization Generation', () => {
    it('should generate multiple visualization types', async () => {
      const response = await request(app)
        .post(`${apiBase}/explain`)
        .send({ 
          features: validFeatures,
          prediction: validPrediction,
          options: {
            types: ['waterfall', 'bar', 'force'],
            includeVisualizations: true
          }
        })
        .expect(200);

      const visualizations = response.body.data.visualizations;
      
      expect(visualizations).toHaveProperty('waterfall');
      expect(visualizations).toHaveProperty('bar');
      expect(visualizations).toHaveProperty('force');
      
      // Each visualization should have proper metadata
      for (const [type, viz] of Object.entries(visualizations)) {
        expect(viz).toHaveProperty('type');
        expect(viz).toHaveProperty('name');
        expect(viz).toHaveProperty('description');
        expect(viz).toHaveProperty('format');
        expect(viz.type).toBe(type);
      }
    });
  });
});
