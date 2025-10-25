const cognitiveModelService = require('../services/cognitiveModelService');
const { validationResult } = require('express-validator');

/**
 * Score cognitive features using ML model
 * POST /api/cognitive-model/score
 */
const scoreFeatures = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid input parameters',
        details: errors.array()
      });
    }

    const { features, options = {} } = req.body;
    const startTime = Date.now();

    // Score features using ML model
    const scoringResult = await cognitiveModelService.scoreFeatures(features, options);
    
    const processingTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      message: 'Cognitive features scored successfully',
      data: {
        ...scoringResult,
        apiProcessingTime: processingTime
      }
    });

  } catch (error) {
    console.error('Cognitive model scoring error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Model scoring failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Score features from existing analysis
 * POST /api/cognitive-model/score-analysis/:analysisId
 */
const scoreAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { options = {} } = req.body;

    // Load analysis from feature extraction service
    const analysisPath = `./data/features/analysis_${analysisId}.json`;
    const fs = require('fs-extra');
    
    if (!await fs.pathExists(analysisPath)) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
        message: `No analysis found with ID: ${analysisId}`
      });
    }

    const analysisData = await fs.readJson(analysisPath);
    const features = analysisData.features;

    if (!features) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis data',
        message: 'Analysis does not contain feature data'
      });
    }

    const startTime = Date.now();

    // Score the extracted features
    const scoringResult = await cognitiveModelService.scoreFeatures(features, {
      ...options,
      sourceAnalysisId: analysisId,
      sourceTimestamp: analysisData.timestamp
    });

    const processingTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      message: 'Analysis scored successfully',
      data: {
        ...scoringResult,
        sourceAnalysisId: analysisId,
        apiProcessingTime: processingTime
      }
    });

  } catch (error) {
    console.error('Analysis scoring error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Analysis scoring failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Batch score multiple feature sets
 * POST /api/cognitive-model/batch-score
 */
const batchScore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid input parameters',
        details: errors.array()
      });
    }

    const { featureSets, options = {} } = req.body;
    const startTime = Date.now();

    if (!Array.isArray(featureSets) || featureSets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'featureSets must be a non-empty array'
      });
    }

    if (featureSets.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Batch size exceeded',
        message: 'Maximum 10 feature sets allowed per batch'
      });
    }

    // Score each feature set
    const results = [];
    const batchErrors = [];

    for (let i = 0; i < featureSets.length; i++) {
      try {
        const features = featureSets[i];
        const scoringResult = await cognitiveModelService.scoreFeatures(features, {
          ...options,
          batchIndex: i,
          batchSize: featureSets.length
        });
        
        results.push({
          index: i,
          success: true,
          result: scoringResult
        });
      } catch (error) {
        batchErrors.push({
          index: i,
          error: error.message
        });
        
        results.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }

    const processingTime = (Date.now() - startTime) / 1000;
    const successCount = results.filter(r => r.success).length;

    res.status(200).json({
      success: true,
      message: `Batch scoring completed: ${successCount}/${featureSets.length} successful`,
      data: {
        results,
        summary: {
          total: featureSets.length,
          successful: successCount,
          failed: batchErrors.length,
          processingTime
        },
        errors: batchErrors.length > 0 ? batchErrors : undefined
      }
    });

  } catch (error) {
    console.error('Batch scoring error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Batch scoring failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Compare scores between multiple analyses
 * POST /api/cognitive-model/compare-scores
 */
const compareScores = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid input parameters',
        details: errors.array()
      });
    }

    const { scoringIds, options = {} } = req.body;

    if (!Array.isArray(scoringIds) || scoringIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'At least 2 scoring IDs required for comparison'
      });
    }

    if (scoringIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many comparisons',
        message: 'Maximum 10 scores can be compared at once'
      });
    }

    const startTime = Date.now();

    // Load scoring results
    const fs = require('fs-extra');
    const scores = [];
    const notFound = [];

    for (const scoringId of scoringIds) {
      try {
        const scorePath = `./data/model-scores/score_${scoringId}_*.json`;
        const glob = require('glob');
        const files = glob.sync(scorePath);
        
        if (files.length === 0) {
          notFound.push(scoringId);
          continue;
        }

        const scoreData = await fs.readJson(files[0]);
        scores.push(scoreData);
      } catch (error) {
        notFound.push(scoringId);
      }
    }

    if (scores.length < 2) {
      return res.status(404).json({
        success: false,
        error: 'Insufficient data',
        message: `Need at least 2 valid scores for comparison. Found: ${scores.length}`,
        notFound
      });
    }

    // Perform comparison analysis
    const comparison = {
      scoreCount: scores.length,
      scores: scores.map(s => ({
        scoringId: s.scoringId,
        riskScore: s.riskScore,
        riskCategory: s.riskCategory,
        confidence: s.confidence,
        timestamp: s.timestamp
      })),
      statistics: {
        averageScore: scores.reduce((sum, s) => sum + s.riskScore, 0) / scores.length,
        minScore: Math.min(...scores.map(s => s.riskScore)),
        maxScore: Math.max(...scores.map(s => s.riskScore)),
        scoreRange: Math.max(...scores.map(s => s.riskScore)) - Math.min(...scores.map(s => s.riskScore)),
        averageConfidence: scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length
      },
      trends: {
        improvement: 0,
        decline: 0,
        stable: 0
      },
      insights: []
    };

    // Calculate trends (if scores are chronologically ordered)
    for (let i = 1; i < scores.length; i++) {
      const current = scores[i].riskScore;
      const previous = scores[i - 1].riskScore;
      const change = current - previous;
      
      if (Math.abs(change) < 0.05) {
        comparison.trends.stable++;
      } else if (change > 0) {
        comparison.trends.improvement++;
      } else {
        comparison.trends.decline++;
      }
    }

    // Generate insights
    if (comparison.statistics.scoreRange > 0.3) {
      comparison.insights.push('Significant variation in scores observed - consider factors affecting consistency');
    }

    if (comparison.trends.improvement > comparison.trends.decline) {
      comparison.insights.push('Overall positive trend in cognitive health scores');
    } else if (comparison.trends.decline > comparison.trends.improvement) {
      comparison.insights.push('Declining trend in cognitive health scores - consider professional consultation');
    } else {
      comparison.insights.push('Stable cognitive health scores over time');
    }

    if (comparison.statistics.averageConfidence < 0.6) {
      comparison.insights.push('Lower average confidence - results should be interpreted cautiously');
    }

    const processingTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      message: 'Score comparison completed successfully',
      data: {
        comparison,
        processingTime,
        notFound: notFound.length > 0 ? notFound : undefined
      }
    });

  } catch (error) {
    console.error('Score comparison error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Score comparison failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get model health and status
 * GET /api/cognitive-model/health
 */
const getModelHealth = async (req, res) => {
  try {
    const health = await cognitiveModelService.getModelHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      message: `Model service is ${health.status}`,
      data: health
    });

  } catch (error) {
    console.error('Model health check error:', error);
    
    res.status(503).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Get model capabilities and metadata
 * GET /api/cognitive-model/capabilities
 */
const getCapabilities = async (req, res) => {
  try {
    const capabilities = {
      models: {
        primary: {
          name: 'Cognitive Health Ensemble Classifier',
          version: '1.0.0',
          type: 'ensemble',
          algorithms: ['RandomForest', 'GradientBoosting', 'NeuralNetwork', 'SVM'],
          features: 47,
          accuracy: 0.892,
          precision: 0.885,
          recall: 0.901,
          f1Score: 0.893
        },
        fallback: {
          name: 'Rule-based Classifier',
          version: '1.0.0',
          type: 'rule-based',
          features: 25,
          accuracy: 0.756
        }
      },
      features: {
        scoring: {
          description: 'Score cognitive features using ML models',
          endpoint: '/api/cognitive-model/score',
          methods: ['POST'],
          inputFeatures: [
            'basic.wordCount', 'basic.sentenceCount', 'basic.typeTokenRatio',
            'lexical.vocabularySize', 'lexical.lexicalDiversity', 'lexical.complexWordRatio',
            'cognitive.cognitiveHealthScore', 'cognitive.syntacticComplexity', 'cognitive.informationDensity'
          ],
          outputFields: ['riskScore', 'confidence', 'riskCategory', 'featureImportance', 'clinicalInterpretation']
        },
        batchScoring: {
          description: 'Score multiple feature sets in batch',
          endpoint: '/api/cognitive-model/batch-score',
          maxBatchSize: 10
        },
        comparison: {
          description: 'Compare multiple scoring results',
          endpoint: '/api/cognitive-model/compare-scores',
          maxComparisons: 10
        }
      },
      riskCategories: {
        low: {
          range: '70-100%',
          description: 'Cognitive indicators within normal ranges',
          color: 'green',
          recommendations: ['Continue healthy lifestyle', 'Regular monitoring']
        },
        moderate: {
          range: '40-69%',
          description: 'Some indicators suggest monitoring may be beneficial',
          color: 'yellow',
          recommendations: ['Discuss with healthcare provider', 'Follow-up assessment']
        },
        high: {
          range: '0-39%',
          description: 'Multiple indicators suggest professional evaluation',
          color: 'red',
          recommendations: ['Professional evaluation', 'Comprehensive assessment']
        }
      },
      confidenceInterpretation: {
        high: '80-95%: Results are highly reliable',
        moderate: '60-79%: Results are moderately reliable',
        low: '30-59%: Results should be interpreted with caution'
      },
      limitations: [
        'This is not a diagnostic tool and cannot replace clinical evaluation',
        'Results may be influenced by education, language background, and health status',
        'Single assessment provides limited information - longitudinal tracking recommended',
        'Model performance may vary with different populations and languages'
      ],
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Model capabilities retrieved successfully',
      data: capabilities
    });

  } catch (error) {
    console.error('Capabilities retrieval error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve capabilities',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get scoring statistics
 * GET /api/cognitive-model/stats
 */
const getStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Load scoring results from data directory
    const fs = require('fs-extra');
    const glob = require('glob');
    const path = require('path');
    
    const scoresDir = path.join(__dirname, '../data/model-scores');
    await fs.ensureDir(scoresDir);
    
    const scoreFiles = glob.sync(path.join(scoresDir, 'score_*.json'));
    
    let scores = [];
    for (const file of scoreFiles) {
      try {
        const scoreData = await fs.readJson(file);
        
        // Filter by date range if provided
        if (dateFrom || dateTo) {
          const scoreDate = new Date(scoreData.timestamp);
          if (dateFrom && scoreDate < new Date(dateFrom)) continue;
          if (dateTo && scoreDate > new Date(dateTo)) continue;
        }
        
        scores.push(scoreData);
      } catch (error) {
        // Skip invalid files
        continue;
      }
    }

    // Calculate statistics
    const stats = {
      total: scores.length,
      dateRange: {
        from: dateFrom || (scores.length > 0 ? Math.min(...scores.map(s => new Date(s.timestamp))) : null),
        to: dateTo || (scores.length > 0 ? Math.max(...scores.map(s => new Date(s.timestamp))) : null)
      },
      riskDistribution: {
        low: scores.filter(s => s.riskScore >= 0.7).length,
        moderate: scores.filter(s => s.riskScore >= 0.4 && s.riskScore < 0.7).length,
        high: scores.filter(s => s.riskScore < 0.4).length
      },
      averageScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s.riskScore, 0) / scores.length : 0,
      averageConfidence: scores.length > 0 ? scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length : 0,
      modelUsage: {
        primary: scores.filter(s => s.modelMetadata?.modelType !== 'rule-based').length,
        fallback: scores.filter(s => s.modelMetadata?.modelType === 'rule-based').length
      },
      processingTimes: {
        average: scores.length > 0 ? scores.reduce((sum, s) => sum + (s.processingTime || 0), 0) / scores.length : 0,
        min: scores.length > 0 ? Math.min(...scores.map(s => s.processingTime || 0)) : 0,
        max: scores.length > 0 ? Math.max(...scores.map(s => s.processingTime || 0)) : 0
      }
    };

    res.status(200).json({
      success: true,
      message: 'Scoring statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Stats retrieval error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  scoreFeatures,
  scoreAnalysis,
  batchScore,
  compareScores,
  getModelHealth,
  getCapabilities,
  getStats
};
