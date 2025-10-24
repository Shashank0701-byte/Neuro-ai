const featureExtractionService = require('../services/featureExtractionService');
const speechToTextService = require('../services/speechToTextService');

class FeatureExtractionController {
  /**
   * Extract features from text
   * POST /api/feature-extraction/analyze
   */
  async analyzeText(req, res) {
    try {
      const { text, options = {} } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid text input',
          message: 'Text is required and must be a non-empty string'
        });
      }

      if (text.length > 50000) {
        return res.status(400).json({
          success: false,
          error: 'Text too long',
          message: 'Text must be less than 50,000 characters'
        });
      }

      console.log(`Starting feature extraction for text (${text.length} characters)`);
      
      // Extract features
      const result = await featureExtractionService.extractFeatures(text, options);

      // Check if extraction was successful
      if (result.status === 'failed') {
        return res.status(500).json({
          success: false,
          error: 'Feature extraction failed',
          message: result.error,
          analysisId: result.id
        });
      }

      // Return successful response
      res.status(200).json({
        success: true,
        message: 'Feature extraction completed successfully',
        data: {
          analysisId: result.id,
          features: result.features,
          processingTime: result.processingTime,
          metadata: result.metadata
        },
        summary: this._generateFeatureSummary(result.features),
        cognitiveInsights: this._generateCognitiveInsights(result.features)
      });

    } catch (error) {
      console.error('Feature extraction controller error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while processing the feature extraction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Extract features from transcription
   * POST /api/feature-extraction/analyze-transcription/:transcriptionId
   */
  async analyzeTranscription(req, res) {
    try {
      const { transcriptionId } = req.params;
      const { options = {} } = req.body;
      
      if (!transcriptionId) {
        return res.status(400).json({
          success: false,
          error: 'Missing transcription ID',
          message: 'Transcription ID is required'
        });
      }

      // Get transcription data
      const transcription = await speechToTextService.getTranscription(transcriptionId);
      
      if (!transcription) {
        return res.status(404).json({
          success: false,
          error: 'Transcription not found',
          message: `No transcription found with ID: ${transcriptionId}`
        });
      }

      if (transcription.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Transcription not completed',
          message: 'Cannot analyze incomplete transcription'
        });
      }

      console.log(`Analyzing transcription: ${transcriptionId}`);
      
      // Extract features from transcription
      const result = await featureExtractionService.extractFromTranscription(transcription);

      if (result.status === 'failed') {
        return res.status(500).json({
          success: false,
          error: 'Feature extraction failed',
          message: result.error,
          analysisId: result.id
        });
      }

      res.status(200).json({
        success: true,
        message: 'Transcription analysis completed successfully',
        data: {
          analysisId: result.id,
          transcriptionId: transcriptionId,
          features: result.features,
          processingTime: result.processingTime,
          metadata: result.metadata
        },
        summary: this._generateFeatureSummary(result.features),
        cognitiveInsights: this._generateCognitiveInsights(result.features),
        speechInsights: this._generateSpeechInsights(result.features)
      });

    } catch (error) {
      console.error('Transcription analysis error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while analyzing the transcription'
      });
    }
  }

  /**
   * Get analysis by ID
   * GET /api/feature-extraction/analyses/:id
   */
  async getAnalysis(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing analysis ID',
          message: 'Analysis ID is required'
        });
      }

      const analysis = await featureExtractionService.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: 'Analysis not found',
          message: `No analysis found with ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        data: analysis,
        summary: this._generateFeatureSummary(analysis.features),
        cognitiveInsights: this._generateCognitiveInsights(analysis.features)
      });

    } catch (error) {
      console.error('Get analysis error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while retrieving the analysis'
      });
    }
  }

  /**
   * Get all analyses with pagination
   * GET /api/feature-extraction/analyses
   */
  async getAnalyses(req, res) {
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

      const result = await featureExtractionService.getAnalyses(options);
      
      res.status(200).json({
        success: true,
        data: result.analyses,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get analyses error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while retrieving analyses'
      });
    }
  }

  /**
   * Delete analysis by ID
   * DELETE /api/feature-extraction/analyses/:id
   */
  async deleteAnalysis(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Missing analysis ID',
          message: 'Analysis ID is required'
        });
      }

      const deleted = await featureExtractionService.deleteAnalysis(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Analysis not found',
          message: `No analysis found with ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Analysis deleted successfully',
        analysisId: id
      });

    } catch (error) {
      console.error('Delete analysis error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while deleting the analysis'
      });
    }
  }

  /**
   * Get feature extraction statistics
   * GET /api/feature-extraction/stats
   */
  async getStats(req, res) {
    try {
      const { dateFrom, dateTo } = req.query;
      
      const options = { dateFrom, dateTo };
      const result = await featureExtractionService.getAnalyses(options);
      
      // Calculate statistics
      const stats = {
        total: result.pagination.total,
        completed: 0,
        failed: 0,
        averageProcessingTime: 0,
        averageTextLength: 0,
        averageWordCount: 0,
        cognitiveHealthDistribution: {
          high: 0,
          medium: 0,
          low: 0
        },
        featureDistribution: {},
        dateRange: {
          from: dateFrom || 'all time',
          to: dateTo || 'now'
        }
      };

      let totalProcessingTime = 0;
      let totalTextLength = 0;
      let totalWordCount = 0;
      let completedCount = 0;

      result.analyses.forEach(analysis => {
        if (analysis.status === 'completed') {
          stats.completed++;
          completedCount++;
          
          if (analysis.processingTime) {
            totalProcessingTime += analysis.processingTime;
          }
          
          if (analysis.metadata) {
            totalTextLength += analysis.metadata.textLength || 0;
            totalWordCount += analysis.metadata.wordCount || 0;
          }

          // Cognitive health distribution
          if (analysis.features && analysis.features.cognitive) {
            const score = analysis.features.cognitive.cognitiveHealthScore || 0;
            if (score >= 0.7) stats.cognitiveHealthDistribution.high++;
            else if (score >= 0.4) stats.cognitiveHealthDistribution.medium++;
            else stats.cognitiveHealthDistribution.low++;
          }

          // Feature availability
          if (analysis.features) {
            Object.keys(analysis.features).forEach(feature => {
              stats.featureDistribution[feature] = (stats.featureDistribution[feature] || 0) + 1;
            });
          }
        } else if (analysis.status === 'failed') {
          stats.failed++;
        }
      });

      // Calculate averages
      if (completedCount > 0) {
        stats.averageProcessingTime = totalProcessingTime / completedCount;
        stats.averageTextLength = totalTextLength / completedCount;
        stats.averageWordCount = totalWordCount / completedCount;
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
   * Compare multiple analyses
   * POST /api/feature-extraction/compare
   */
  async compareAnalyses(req, res) {
    try {
      const { analysisIds } = req.body;
      
      if (!Array.isArray(analysisIds) || analysisIds.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Invalid analysis IDs',
          message: 'At least 2 analysis IDs are required for comparison'
        });
      }

      if (analysisIds.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Too many analyses',
          message: 'Maximum 10 analyses can be compared at once'
        });
      }

      // Fetch all analyses
      const analyses = [];
      for (const id of analysisIds) {
        const analysis = await featureExtractionService.getAnalysis(id);
        if (analysis) {
          analyses.push(analysis);
        }
      }

      if (analyses.length < 2) {
        return res.status(404).json({
          success: false,
          error: 'Insufficient analyses found',
          message: 'At least 2 valid analyses are required for comparison'
        });
      }

      // Generate comparison
      const comparison = this._generateComparison(analyses);

      res.status(200).json({
        success: true,
        message: 'Analysis comparison completed',
        data: {
          analysisCount: analyses.length,
          comparison,
          insights: this._generateComparisonInsights(comparison)
        }
      });

    } catch (error) {
      console.error('Compare analyses error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while comparing analyses'
      });
    }
  }

  /**
   * Get service health status
   * GET /api/feature-extraction/health
   */
  async getHealth(req, res) {
    try {
      const health = await featureExtractionService.getHealthStatus();
      
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
   * Get available features and capabilities
   * GET /api/feature-extraction/capabilities
   */
  getCapabilities(req, res) {
    const capabilities = {
      features: {
        basic: {
          description: 'Basic text statistics (word count, sentence count, etc.)',
          available: true
        },
        lexical: {
          description: 'Lexical diversity and vocabulary analysis',
          available: true
        },
        sentiment: {
          description: 'Sentiment analysis and emotional indicators',
          available: true
        },
        readability: {
          description: 'Readability scores and complexity measures',
          available: true
        },
        linguistic: {
          description: 'Part-of-speech analysis and linguistic patterns',
          available: true
        },
        discourse: {
          description: 'Discourse markers and text coherence',
          available: true
        },
        speech: {
          description: 'Speech-specific features (timing, rate, hesitations)',
          available: true,
          requiresTranscription: true
        },
        advanced: {
          description: 'Advanced NLP features using spaCy (syntax, semantics)',
          available: process.env.ENABLE_ADVANCED_NLP === 'true'
        },
        cognitive: {
          description: 'Cognitive health indicators and scoring',
          available: process.env.COGNITIVE_ANALYSIS_ENABLED === 'true'
        }
      },
      limits: {
        maxTextLength: 50000,
        maxComparisons: 10,
        supportedLanguages: ['en']
      },
      requirements: {
        python: process.env.PYTHON_PATH || 'python3',
        spacyModel: process.env.SPACY_MODEL || 'en_core_web_sm'
      }
    };

    res.status(200).json({
      success: true,
      data: capabilities
    });
  }

  // Helper methods
  _generateFeatureSummary(features) {
    const summary = {
      textComplexity: 'unknown',
      readabilityLevel: 'unknown',
      sentimentPolarity: 'unknown',
      cognitiveHealthScore: null,
      keyInsights: []
    };

    if (features.readability) {
      summary.readabilityLevel = features.readability.readabilityLevel || 'unknown';
      summary.keyInsights.push(`Text readability: ${summary.readabilityLevel}`);
    }

    if (features.sentiment) {
      summary.sentimentPolarity = features.sentiment.sentimentPolarity || 'unknown';
      summary.keyInsights.push(`Overall sentiment: ${summary.sentimentPolarity}`);
    }

    if (features.cognitive) {
      summary.cognitiveHealthScore = features.cognitive.cognitiveHealthScore;
      const scoreLevel = this._classifyCognitiveScore(summary.cognitiveHealthScore);
      summary.keyInsights.push(`Cognitive health indicator: ${scoreLevel}`);
    }

    if (features.lexical) {
      const diversity = features.lexical.typeTokenRatio || 0;
      const diversityLevel = diversity > 0.6 ? 'high' : diversity > 0.4 ? 'medium' : 'low';
      summary.keyInsights.push(`Vocabulary diversity: ${diversityLevel}`);
    }

    return summary;
  }

  _generateCognitiveInsights(features) {
    const insights = {
      strengths: [],
      concerns: [],
      recommendations: [],
      overallAssessment: 'normal'
    };

    if (features.cognitive) {
      const score = features.cognitive.cognitiveHealthScore || 0;
      
      if (score >= 0.7) {
        insights.overallAssessment = 'good';
        insights.strengths.push('Strong cognitive indicators');
      } else if (score < 0.4) {
        insights.overallAssessment = 'needs_attention';
        insights.concerns.push('Some cognitive indicators below expected range');
      }

      if (features.cognitive.lexicalDiversity > 0.6) {
        insights.strengths.push('Rich vocabulary usage');
      } else if (features.cognitive.lexicalDiversity < 0.3) {
        insights.concerns.push('Limited vocabulary diversity');
        insights.recommendations.push('Consider vocabulary expansion exercises');
      }

      if (features.cognitive.hesitationRatio > 0.1) {
        insights.concerns.push('Frequent hesitation markers detected');
        insights.recommendations.push('Practice fluency exercises');
      }

      if (features.cognitive.repetitionScore > 0.3) {
        insights.concerns.push('High word repetition observed');
        insights.recommendations.push('Focus on varied expression');
      }
    }

    return insights;
  }

  _generateSpeechInsights(features) {
    const insights = {
      speechRate: 'normal',
      fluency: 'normal',
      articulation: 'normal',
      recommendations: []
    };

    if (features.speech) {
      if (features.speech.wordsPerMinute) {
        const wpm = features.speech.wordsPerMinute;
        if (wpm < 120) {
          insights.speechRate = 'slow';
          insights.recommendations.push('Consider speech rate exercises');
        } else if (wpm > 200) {
          insights.speechRate = 'fast';
          insights.recommendations.push('Practice controlled speech pacing');
        }
      }

      if (features.speech.hesitationMarkers) {
        const hesitationRatio = features.speech.hesitationMarkers.ratio || 0;
        if (hesitationRatio > 0.05) {
          insights.fluency = 'needs_improvement';
          insights.recommendations.push('Work on speech fluency');
        }
      }
    }

    return insights;
  }

  _generateComparison(analyses) {
    const comparison = {
      metrics: {},
      trends: {},
      differences: {}
    };

    // Extract key metrics for comparison
    const metrics = ['cognitiveHealthScore', 'lexicalDiversity', 'sentimentScore', 'readabilityScore'];
    
    metrics.forEach(metric => {
      const values = analyses.map(analysis => this._extractMetricValue(analysis, metric)).filter(v => v !== null);
      
      if (values.length > 0) {
        comparison.metrics[metric] = {
          values,
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          range: Math.max(...values) - Math.min(...values)
        };
      }
    });

    return comparison;
  }

  _generateComparisonInsights(comparison) {
    const insights = [];

    Object.entries(comparison.metrics).forEach(([metric, data]) => {
      if (data.range > 0.2) {
        insights.push(`Significant variation in ${metric} (range: ${data.range.toFixed(2)})`);
      }
      
      if (metric === 'cognitiveHealthScore') {
        const trend = data.values[data.values.length - 1] - data.values[0];
        if (Math.abs(trend) > 0.1) {
          insights.push(`Cognitive health ${trend > 0 ? 'improvement' : 'decline'} trend observed`);
        }
      }
    });

    return insights;
  }

  _extractMetricValue(analysis, metric) {
    switch (metric) {
      case 'cognitiveHealthScore':
        return analysis.features?.cognitive?.cognitiveHealthScore || null;
      case 'lexicalDiversity':
        return analysis.features?.lexical?.typeTokenRatio || null;
      case 'sentimentScore':
        return analysis.features?.sentiment?.sentimentScore || null;
      case 'readabilityScore':
        return analysis.features?.readability?.fleschReadingEase || null;
      default:
        return null;
    }
  }

  _classifyCognitiveScore(score) {
    if (score === null || score === undefined) return 'unknown';
    if (score >= 0.7) return 'good';
    if (score >= 0.4) return 'fair';
    return 'needs_attention';
  }
}

module.exports = new FeatureExtractionController();
