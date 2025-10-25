const explainabilityService = require('../services/explainabilityService');
const cognitiveModelService = require('../services/cognitiveModelService');
const { validationResult } = require('express-validator');
const fs = require('fs-extra');
const path = require('path');

/**
 * Generate SHAP explanation for cognitive model prediction
 * POST /api/explainability/explain
 */
const generateExplanation = async (req, res) => {
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

    const { features, prediction, options = {} } = req.body;
    const startTime = Date.now();

    // Generate SHAP explanation
    const explanation = await explainabilityService.generateExplanation(features, prediction, options);
    
    const processingTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      message: 'SHAP explanation generated successfully',
      data: {
        ...explanation,
        apiProcessingTime: processingTime
      }
    });

  } catch (error) {
    console.error('SHAP explanation generation error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Explanation generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Generate explanation for existing scoring result
 * POST /api/explainability/explain-score/:scoringId
 */
const explainScore = async (req, res) => {
  try {
    const { scoringId } = req.params;
    const { options = {} } = req.body;

    // Load scoring result
    const glob = require('glob');
    const scorePath = `./data/model-scores/score_${scoringId}_*.json`;
    const files = glob.sync(scorePath);
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scoring result not found',
        message: `No scoring result found with ID: ${scoringId}`
      });
    }

    const scoringData = await fs.readJson(files[0]);
    
    // Extract features from scoring metadata or load from analysis
    let features = null;
    if (scoringData.sourceAnalysisId) {
      // Load features from original analysis
      const analysisPath = `./data/features/analysis_${scoringData.sourceAnalysisId}.json`;
      if (await fs.pathExists(analysisPath)) {
        const analysisData = await fs.readJson(analysisPath);
        features = analysisData.features;
      }
    }

    if (!features) {
      return res.status(400).json({
        success: false,
        error: 'Features not available',
        message: 'Cannot generate explanation without original features'
      });
    }

    const startTime = Date.now();

    // Generate explanation
    const explanation = await explainabilityService.generateExplanation(features, scoringData, {
      ...options,
      sourceScoreId: scoringId
    });

    const processingTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      message: 'Score explanation generated successfully',
      data: {
        ...explanation,
        sourceScoreId: scoringId,
        apiProcessingTime: processingTime
      }
    });

  } catch (error) {
    console.error('Score explanation error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Score explanation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Generate explanation with integrated scoring
 * POST /api/explainability/score-and-explain
 */
const scoreAndExplain = async (req, res) => {
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

    const { features, scoringOptions = {}, explanationOptions = {} } = req.body;
    const startTime = Date.now();

    // First, score the features
    const scoringResult = await cognitiveModelService.scoreFeatures(features, scoringOptions);

    // Then, generate explanation
    const explanation = await explainabilityService.generateExplanation(features, scoringResult, {
      ...explanationOptions,
      integratedScoring: true
    });

    const processingTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      message: 'Scoring and explanation completed successfully',
      data: {
        scoring: scoringResult,
        explanation,
        integrated: true,
        apiProcessingTime: processingTime
      }
    });

  } catch (error) {
    console.error('Score and explain error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Score and explain failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get explanation by ID
 * GET /api/explainability/explanation/:explanationId
 */
const getExplanation = async (req, res) => {
  try {
    const { explanationId } = req.params;

    const explanation = await explainabilityService.getExplanation(explanationId);

    res.status(200).json({
      success: true,
      message: 'Explanation retrieved successfully',
      data: explanation
    });

  } catch (error) {
    console.error('Explanation retrieval error:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: statusCode === 404 ? 'Explanation not found' : 'Explanation retrieval failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Serve visualization files
 * GET /api/explainability/visualization/:filename
 */
const getVisualization = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename',
        message: 'Filename contains invalid characters'
      });
    }

    const visualizationsPath = path.join(__dirname, '../data/visualizations');
    const filepath = path.join(visualizationsPath, filename);

    // Check if file exists
    if (!await fs.pathExists(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'Visualization not found',
        message: 'The requested visualization file does not exist'
      });
    }

    // Get file extension to set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.html':
        contentType = 'text/html';
        break;
      case '.json':
        contentType = 'application/json';
        break;
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Stream file
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Visualization serving error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Visualization serving failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Compare explanations between multiple predictions
 * POST /api/explainability/compare
 */
const compareExplanations = async (req, res) => {
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

    const { explanationIds, options = {} } = req.body;

    if (!Array.isArray(explanationIds) || explanationIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'At least 2 explanation IDs required for comparison'
      });
    }

    if (explanationIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many comparisons',
        message: 'Maximum 10 explanations can be compared at once'
      });
    }

    const startTime = Date.now();

    // Load all explanations
    const explanations = [];
    const notFound = [];

    for (const explanationId of explanationIds) {
      try {
        const explanation = await explainabilityService.getExplanation(explanationId);
        explanations.push(explanation);
      } catch (error) {
        notFound.push(explanationId);
      }
    }

    if (explanations.length < 2) {
      return res.status(404).json({
        success: false,
        error: 'Insufficient data',
        message: `Need at least 2 valid explanations for comparison. Found: ${explanations.length}`,
        notFound
      });
    }

    // Perform comparison analysis
    const comparison = await performExplanationComparison(explanations, options);
    
    const processingTime = (Date.now() - startTime) / 1000;

    res.status(200).json({
      success: true,
      message: 'Explanation comparison completed successfully',
      data: {
        comparison,
        explanationCount: explanations.length,
        processingTime,
        notFound: notFound.length > 0 ? notFound : undefined
      }
    });

  } catch (error) {
    console.error('Explanation comparison error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Explanation comparison failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get explainability service health
 * GET /api/explainability/health
 */
const getHealth = async (req, res) => {
  try {
    const health = await explainabilityService.getHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      message: `Explainability service is ${health.status}`,
      data: health
    });

  } catch (error) {
    console.error('Explainability health check error:', error);
    
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
 * Get explainability capabilities
 * GET /api/explainability/capabilities
 */
const getCapabilities = async (req, res) => {
  try {
    const explanationTypes = explainabilityService.getExplanationTypes();
    
    const capabilities = {
      explanationTypes,
      features: {
        shapGeneration: {
          description: 'Generate SHAP values for model predictions',
          endpoint: '/api/explainability/explain',
          methods: ['POST'],
          inputRequirements: ['features', 'prediction'],
          outputTypes: ['shapValues', 'featureAttributions', 'insights']
        },
        visualizationGeneration: {
          description: 'Create visual explanations and plots',
          supportedTypes: Object.keys(explanationTypes),
          formats: ['png', 'html', 'svg'],
          interactive: true
        },
        integratedScoring: {
          description: 'Score and explain in single request',
          endpoint: '/api/explainability/score-and-explain',
          benefits: ['Reduced latency', 'Consistent data flow', 'Simplified workflow']
        },
        comparison: {
          description: 'Compare explanations across predictions',
          endpoint: '/api/explainability/compare',
          maxComparisons: 10,
          analysisTypes: ['feature_importance', 'prediction_differences', 'trend_analysis']
        }
      },
      clinicalInterpretation: {
        featureCategories: {
          cognitive: 'Core cognitive function measurements',
          lexical: 'Language complexity and vocabulary usage',
          basic: 'Basic speech production metrics',
          sentiment: 'Emotional tone and sentiment analysis'
        },
        interpretationLevels: ['feature_level', 'category_level', 'global_level'],
        clinicalRelevance: ['domain_specific', 'actionable_insights', 'risk_factors']
      },
      technicalDetails: {
        shapMethods: ['TreeExplainer', 'LinearExplainer', 'KernelExplainer'],
        fallbackMethods: ['feature_importance', 'linear_approximation'],
        visualizationLibraries: ['matplotlib', 'seaborn', 'plotly'],
        supportedModels: ['ensemble', 'tree_based', 'linear', 'neural_network']
      },
      limitations: [
        'SHAP values are approximations based on model behavior',
        'Explanations are specific to the model and training data',
        'Feature interactions may not be fully captured',
        'Visualization generation requires sufficient computational resources'
      ],
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Explainability capabilities retrieved successfully',
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
 * Get explainability statistics
 * GET /api/explainability/stats
 */
const getStats = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Load explanations from data directory
    const glob = require('glob');
    const explanationsPath = path.join(__dirname, '../data/explanations');
    await fs.ensureDir(explanationsPath);
    
    const explanationFiles = glob.sync(path.join(explanationsPath, 'explanation_*.json'));
    
    let explanations = [];
    for (const file of explanationFiles) {
      try {
        const explanationData = await fs.readJson(file);
        
        // Filter by date range if provided
        if (dateFrom || dateTo) {
          const explanationDate = new Date(explanationData.timestamp);
          if (dateFrom && explanationDate < new Date(dateFrom)) continue;
          if (dateTo && explanationDate > new Date(dateTo)) continue;
        }
        
        explanations.push(explanationData);
      } catch (error) {
        // Skip invalid files
        continue;
      }
    }

    // Calculate statistics
    const stats = {
      total: explanations.length,
      dateRange: {
        from: dateFrom || (explanations.length > 0 ? Math.min(...explanations.map(e => new Date(e.timestamp))) : null),
        to: dateTo || (explanations.length > 0 ? Math.max(...explanations.map(e => new Date(e.timestamp))) : null)
      },
      explanationTypes: {},
      averageProcessingTime: explanations.length > 0 ? 
        explanations.reduce((sum, e) => sum + (e.metadata?.processingTime || 0), 0) / explanations.length : 0,
      visualizationGeneration: {
        total: 0,
        successful: 0,
        failed: 0,
        byType: {}
      },
      featureImportance: {
        topFeatures: {},
        averageImportance: {}
      },
      clinicalInsights: {
        totalFindings: 0,
        riskDistribution: { low: 0, moderate: 0, high: 0 },
        commonRecommendations: {}
      }
    };

    // Analyze explanation types
    for (const explanation of explanations) {
      const types = explanation.metadata?.explanationTypes || [];
      for (const type of types) {
        stats.explanationTypes[type] = (stats.explanationTypes[type] || 0) + 1;
      }

      // Analyze visualizations
      if (explanation.visualizations) {
        for (const [type, viz] of Object.entries(explanation.visualizations)) {
          stats.visualizationGeneration.total++;
          if (viz.status === 'ready' || viz.status === 'generated') {
            stats.visualizationGeneration.successful++;
          } else {
            stats.visualizationGeneration.failed++;
          }
          
          stats.visualizationGeneration.byType[type] = 
            (stats.visualizationGeneration.byType[type] || 0) + 1;
        }
      }

      // Analyze feature importance
      if (explanation.featureAttributions) {
        for (const [feature, attribution] of Object.entries(explanation.featureAttributions)) {
          if (!stats.featureImportance.topFeatures[feature]) {
            stats.featureImportance.topFeatures[feature] = [];
          }
          stats.featureImportance.topFeatures[feature].push(attribution.absoluteImportance);
        }
      }

      // Analyze clinical insights
      if (explanation.insights) {
        stats.clinicalInsights.totalFindings += explanation.insights.keyFindings?.length || 0;
        
        // Risk distribution
        const riskLevel = explanation.riskScore >= 0.7 ? 'low' : 
                         explanation.riskScore >= 0.4 ? 'moderate' : 'high';
        stats.clinicalInsights.riskDistribution[riskLevel]++;
      }
    }

    // Calculate average feature importance
    for (const [feature, importanceValues] of Object.entries(stats.featureImportance.topFeatures)) {
      stats.featureImportance.averageImportance[feature] = 
        importanceValues.reduce((sum, val) => sum + val, 0) / importanceValues.length;
    }

    // Sort top features by average importance
    const sortedFeatures = Object.entries(stats.featureImportance.averageImportance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    stats.featureImportance.topFeatures = Object.fromEntries(sortedFeatures);

    res.status(200).json({
      success: true,
      message: 'Explainability statistics retrieved successfully',
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

/**
 * Helper function to perform explanation comparison
 */
async function performExplanationComparison(explanations, options) {
  const comparison = {
    explanationCount: explanations.length,
    timeRange: {
      earliest: Math.min(...explanations.map(e => new Date(e.timestamp))),
      latest: Math.max(...explanations.map(e => new Date(e.timestamp)))
    },
    riskScores: {
      values: explanations.map(e => e.riskScore),
      average: explanations.reduce((sum, e) => sum + e.riskScore, 0) / explanations.length,
      range: Math.max(...explanations.map(e => e.riskScore)) - Math.min(...explanations.map(e => e.riskScore)),
      trend: 'stable' // Will be calculated
    },
    featureConsistency: {},
    shapValueAnalysis: {},
    insights: {
      commonPatterns: [],
      differences: [],
      recommendations: []
    }
  };

  // Analyze feature consistency across explanations
  const allFeatures = new Set();
  explanations.forEach(exp => {
    if (exp.featureAttributions) {
      Object.keys(exp.featureAttributions).forEach(feature => allFeatures.add(feature));
    }
  });

  for (const feature of allFeatures) {
    const featureData = explanations
      .map(exp => exp.featureAttributions?.[feature])
      .filter(attr => attr !== undefined);

    if (featureData.length > 0) {
      const shapValues = featureData.map(attr => attr.shapValue);
      const avgShapValue = shapValues.reduce((sum, val) => sum + val, 0) / shapValues.length;
      const variance = shapValues.reduce((sum, val) => sum + Math.pow(val - avgShapValue, 2), 0) / shapValues.length;
      
      comparison.featureConsistency[feature] = {
        averageShapValue: avgShapValue,
        variance,
        consistency: variance < 0.01 ? 'high' : variance < 0.05 ? 'moderate' : 'low',
        presentInCount: featureData.length
      };
    }
  }

  // Calculate trend
  if (explanations.length >= 3) {
    const scores = explanations.map(e => e.riskScore);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    comparison.riskScores.trend = Math.abs(change) < 0.05 ? 'stable' : 
                                 change > 0 ? 'improving' : 'declining';
  }

  // Generate insights
  const topConsistentFeatures = Object.entries(comparison.featureConsistency)
    .filter(([, data]) => data.consistency === 'high')
    .sort(([,a], [,b]) => Math.abs(b.averageShapValue) - Math.abs(a.averageShapValue))
    .slice(0, 5);

  if (topConsistentFeatures.length > 0) {
    comparison.insights.commonPatterns.push({
      type: 'consistent_features',
      message: `Features ${topConsistentFeatures.map(([name]) => name).join(', ')} show consistent impact across predictions`,
      features: topConsistentFeatures.map(([name, data]) => ({ name, avgImpact: data.averageShapValue }))
    });
  }

  const inconsistentFeatures = Object.entries(comparison.featureConsistency)
    .filter(([, data]) => data.consistency === 'low')
    .slice(0, 3);

  if (inconsistentFeatures.length > 0) {
    comparison.insights.differences.push({
      type: 'inconsistent_features',
      message: `Features ${inconsistentFeatures.map(([name]) => name).join(', ')} show high variability across predictions`,
      features: inconsistentFeatures.map(([name, data]) => ({ name, variance: data.variance }))
    });
  }

  // Recommendations based on comparison
  if (comparison.riskScores.trend === 'declining') {
    comparison.insights.recommendations.push({
      type: 'trend_concern',
      message: 'Declining trend in cognitive health scores warrants attention',
      priority: 'high',
      actions: ['Consider comprehensive evaluation', 'Monitor more frequently', 'Review intervention strategies']
    });
  }

  if (comparison.riskScores.range > 0.3) {
    comparison.insights.recommendations.push({
      type: 'score_variability',
      message: 'High variability in scores suggests need for more consistent assessment conditions',
      priority: 'medium',
      actions: ['Standardize assessment conditions', 'Consider multiple sessions', 'Review data quality']
    });
  }

  return comparison;
}

module.exports = {
  generateExplanation,
  explainScore,
  scoreAndExplain,
  getExplanation,
  getVisualization,
  compareExplanations,
  getHealth,
  getCapabilities,
  getStats
};
