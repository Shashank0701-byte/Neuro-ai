const { PythonShell } = require('python-shell');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

class ExplainabilityService {
  constructor() {
    this.scriptsPath = path.join(__dirname, '../scripts');
    this.visualizationsPath = path.join(__dirname, '../data/visualizations');
    this.explanationsPath = path.join(__dirname, '../data/explanations');
    
    // Feature categories for explanation grouping
    this.featureCategories = {
      cognitive: {
        name: 'Cognitive Health Indicators',
        features: ['cognitiveHealthScore', 'syntacticComplexity', 'informationDensity', 'hesitationRatio'],
        description: 'Core cognitive function measurements',
        color: '#8B5CF6'
      },
      lexical: {
        name: 'Vocabulary & Language',
        features: ['vocabularySize', 'lexicalDiversity', 'complexWordRatio', 'averageWordLength'],
        description: 'Language complexity and vocabulary usage',
        color: '#3B82F6'
      },
      basic: {
        name: 'Speech Patterns',
        features: ['wordCount', 'sentenceCount', 'averageWordsPerSentence', 'typeTokenRatio'],
        description: 'Basic speech production metrics',
        color: '#10B981'
      },
      sentiment: {
        name: 'Emotional Indicators',
        features: ['sentimentScore', 'sentimentPolarity'],
        description: 'Emotional tone and sentiment analysis',
        color: '#F59E0B'
      }
    };

    // SHAP explanation types
    this.explanationTypes = {
      waterfall: {
        name: 'Waterfall Plot',
        description: 'Shows how each feature contributes to the final prediction',
        format: 'png',
        interactive: false
      },
      force: {
        name: 'Force Plot',
        description: 'Interactive visualization showing feature impacts',
        format: 'html',
        interactive: true
      },
      summary: {
        name: 'Summary Plot',
        description: 'Overview of feature importance across all predictions',
        format: 'png',
        interactive: false
      },
      dependence: {
        name: 'Dependence Plot',
        description: 'Shows how feature values affect predictions',
        format: 'png',
        interactive: false
      },
      bar: {
        name: 'Bar Plot',
        description: 'Simple bar chart of feature importance',
        format: 'png',
        interactive: false
      }
    };

    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      await fs.ensureDir(this.visualizationsPath);
      await fs.ensureDir(this.explanationsPath);
    } catch (error) {
      console.warn('Failed to initialize explainability directories:', error.message);
    }
  }

  /**
   * Generate SHAP explanations for a cognitive model prediction
   * @param {Object} features - Input features used for prediction
   * @param {Object} prediction - Model prediction results
   * @param {Object} options - Explanation options
   * @returns {Promise<Object>} SHAP explanation results
   */
  async generateExplanation(features, prediction, options = {}) {
    try {
      const explanationId = uuidv4();
      const timestamp = new Date().toISOString();

      // Validate inputs
      const validationResult = this.validateExplanationInputs(features, prediction, options);
      if (!validationResult.isValid) {
        throw new Error(`Explanation validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Prepare data for SHAP analysis
      const shapData = this.prepareShapData(features, prediction, options);

      // Generate SHAP values using Python script
      const shapResults = await this.generateShapValues(shapData, options);

      // Create visualizations if requested
      const visualizations = await this.generateVisualizations(shapResults, options);

      // Calculate feature attributions and insights
      const attributions = this.calculateFeatureAttributions(shapResults);
      const insights = this.generateExplanationInsights(attributions, features, prediction);

      // Create comprehensive explanation result
      const explanation = {
        explanationId,
        timestamp,
        predictionId: prediction.scoringId || prediction.analysisId,
        riskScore: prediction.riskScore,
        confidence: prediction.confidence,
        shapValues: shapResults.shapValues,
        baseValue: shapResults.baseValue,
        expectedValue: shapResults.expectedValue,
        featureAttributions: attributions,
        visualizations,
        insights,
        metadata: {
          modelType: shapResults.modelType,
          featureCount: Object.keys(features).length,
          explanationTypes: options.types || ['waterfall', 'bar'],
          processingTime: shapResults.processingTime
        },
        interpretability: {
          globalImportance: this.calculateGlobalImportance(attributions),
          localExplanation: this.generateLocalExplanation(attributions, features),
          featureInteractions: this.analyzeFeatureInteractions(shapResults),
          uncertaintyAnalysis: this.analyzeUncertainty(shapResults, prediction)
        }
      };

      // Save explanation for future reference
      await this.saveExplanation(explanation);

      return explanation;

    } catch (error) {
      console.error('SHAP explanation generation error:', error);
      throw new Error(`Explanation generation failed: ${error.message}`);
    }
  }

  /**
   * Generate SHAP values using Python script
   */
  async generateShapValues(shapData, options) {
    return new Promise((resolve, reject) => {
      const pythonOptions = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python3',
        scriptPath: this.scriptsPath,
        args: [JSON.stringify({
          features: shapData.features,
          prediction: shapData.prediction,
          options: {
            ...options,
            explanationTypes: options.types || ['waterfall', 'bar'],
            outputPath: this.visualizationsPath
          }
        })]
      };

      PythonShell.run('shap_explainer.py', pythonOptions, (err, results) => {
        if (err) {
          reject(new Error(`SHAP generation failed: ${err.message}`));
          return;
        }

        try {
          const result = results[0];
          if (!result || !result.shapValues) {
            reject(new Error('Invalid SHAP output format'));
            return;
          }
          
          resolve(result);
        } catch (parseError) {
          reject(new Error(`SHAP result parsing failed: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Generate visualizations from SHAP results
   */
  async generateVisualizations(shapResults, options) {
    const visualizations = {};
    const requestedTypes = options.types || ['waterfall', 'bar'];

    for (const type of requestedTypes) {
      if (this.explanationTypes[type]) {
        try {
          const visualization = await this.createVisualization(type, shapResults, options);
          visualizations[type] = visualization;
        } catch (error) {
          console.warn(`Failed to generate ${type} visualization:`, error.message);
          visualizations[type] = {
            type,
            status: 'failed',
            error: error.message
          };
        }
      }
    }

    return visualizations;
  }

  /**
   * Create individual visualization
   */
  async createVisualization(type, shapResults, options) {
    const explanationType = this.explanationTypes[type];
    const filename = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${explanationType.format}`;
    const filepath = path.join(this.visualizationsPath, filename);

    // Visualization metadata
    const visualization = {
      type,
      name: explanationType.name,
      description: explanationType.description,
      format: explanationType.format,
      interactive: explanationType.interactive,
      filename,
      filepath,
      url: `/api/explainability/visualization/${filename}`,
      createdAt: new Date().toISOString(),
      size: 0
    };

    try {
      // Check if visualization file was created by Python script
      if (await fs.pathExists(filepath)) {
        const stats = await fs.stat(filepath);
        visualization.size = stats.size;
        visualization.status = 'ready';
      } else {
        visualization.status = 'pending';
        visualization.message = 'Visualization generation in progress';
      }
    } catch (error) {
      visualization.status = 'failed';
      visualization.error = error.message;
    }

    return visualization;
  }

  /**
   * Calculate feature attributions from SHAP values
   */
  calculateFeatureAttributions(shapResults) {
    const attributions = {};
    const shapValues = shapResults.shapValues;
    const featureNames = shapResults.featureNames || Object.keys(shapValues);

    for (const featureName of featureNames) {
      const shapValue = shapValues[featureName] || 0;
      
      attributions[featureName] = {
        shapValue,
        absoluteImportance: Math.abs(shapValue),
        direction: shapValue > 0 ? 'positive' : shapValue < 0 ? 'negative' : 'neutral',
        percentageContribution: 0, // Will be calculated after all features
        category: this.getFeatureCategory(featureName),
        interpretation: this.interpretShapValue(featureName, shapValue)
      };
    }

    // Calculate percentage contributions
    const totalAbsoluteImportance = Object.values(attributions)
      .reduce((sum, attr) => sum + attr.absoluteImportance, 0);

    if (totalAbsoluteImportance > 0) {
      for (const attribution of Object.values(attributions)) {
        attribution.percentageContribution = 
          (attribution.absoluteImportance / totalAbsoluteImportance) * 100;
      }
    }

    return attributions;
  }

  /**
   * Generate explanation insights
   */
  generateExplanationInsights(attributions, features, prediction) {
    const insights = {
      topPositiveFeatures: [],
      topNegativeFeatures: [],
      categoryContributions: {},
      keyFindings: [],
      clinicalRelevance: [],
      recommendations: []
    };

    // Sort features by absolute importance
    const sortedFeatures = Object.entries(attributions)
      .sort(([,a], [,b]) => b.absoluteImportance - a.absoluteImportance);

    // Top positive and negative contributors
    insights.topPositiveFeatures = sortedFeatures
      .filter(([, attr]) => attr.direction === 'positive')
      .slice(0, 5)
      .map(([name, attr]) => ({
        feature: name,
        shapValue: attr.shapValue,
        contribution: attr.percentageContribution,
        interpretation: attr.interpretation
      }));

    insights.topNegativeFeatures = sortedFeatures
      .filter(([, attr]) => attr.direction === 'negative')
      .slice(0, 5)
      .map(([name, attr]) => ({
        feature: name,
        shapValue: attr.shapValue,
        contribution: attr.percentageContribution,
        interpretation: attr.interpretation
      }));

    // Category-wise contributions
    for (const [categoryName, category] of Object.entries(this.featureCategories)) {
      const categoryFeatures = Object.entries(attributions)
        .filter(([featureName]) => category.features.includes(featureName));
      
      const totalContribution = categoryFeatures
        .reduce((sum, [, attr]) => sum + attr.absoluteImportance, 0);
      
      insights.categoryContributions[categoryName] = {
        name: category.name,
        totalContribution,
        percentageContribution: (totalContribution / Object.values(attributions)
          .reduce((sum, attr) => sum + attr.absoluteImportance, 0)) * 100,
        features: categoryFeatures.map(([name, attr]) => ({
          name,
          shapValue: attr.shapValue,
          contribution: attr.percentageContribution
        }))
      };
    }

    // Generate key findings
    insights.keyFindings = this.generateKeyFindings(attributions, prediction);
    insights.clinicalRelevance = this.generateClinicalRelevance(attributions, prediction);
    insights.recommendations = this.generateExplainabilityRecommendations(attributions, prediction);

    return insights;
  }

  /**
   * Generate key findings from SHAP analysis
   */
  generateKeyFindings(attributions, prediction) {
    const findings = [];
    const sortedFeatures = Object.entries(attributions)
      .sort(([,a], [,b]) => b.absoluteImportance - a.absoluteImportance);

    // Most influential feature
    if (sortedFeatures.length > 0) {
      const [topFeature, topAttr] = sortedFeatures[0];
      findings.push({
        type: 'primary_driver',
        message: `${topFeature} was the most influential factor, contributing ${topAttr.percentageContribution.toFixed(1)}% to the prediction`,
        importance: 'high',
        feature: topFeature,
        impact: topAttr.direction
      });
    }

    // Risk level explanation
    const riskLevel = prediction.riskScore >= 0.7 ? 'low' : prediction.riskScore >= 0.4 ? 'moderate' : 'high';
    findings.push({
      type: 'risk_explanation',
      message: `The ${riskLevel} risk prediction (${(prediction.riskScore * 100).toFixed(0)}%) was primarily driven by ${sortedFeatures.slice(0, 3).map(([name]) => name).join(', ')}`,
      importance: 'high',
      riskLevel
    });

    // Feature balance analysis
    const positiveCount = Object.values(attributions).filter(attr => attr.direction === 'positive').length;
    const negativeCount = Object.values(attributions).filter(attr => attr.direction === 'negative').length;
    
    if (positiveCount > negativeCount * 2) {
      findings.push({
        type: 'feature_balance',
        message: 'Most features contributed positively to cognitive health, indicating good overall performance',
        importance: 'medium',
        balance: 'positive'
      });
    } else if (negativeCount > positiveCount * 2) {
      findings.push({
        type: 'feature_balance',
        message: 'Several features raised concerns, contributing to lower cognitive health scores',
        importance: 'medium',
        balance: 'negative'
      });
    }

    return findings;
  }

  /**
   * Generate clinical relevance insights
   */
  generateClinicalRelevance(attributions, prediction) {
    const relevance = [];

    // Cognitive health score impact
    if (attributions.cognitiveHealthScore) {
      const cognitiveImpact = attributions.cognitiveHealthScore;
      relevance.push({
        domain: 'cognitive_function',
        message: `Cognitive health score ${cognitiveImpact.direction === 'positive' ? 'supported' : 'detracted from'} the overall assessment`,
        clinicalSignificance: cognitiveImpact.absoluteImportance > 0.1 ? 'high' : 'moderate',
        recommendation: cognitiveImpact.direction === 'negative' ? 'Consider comprehensive cognitive evaluation' : 'Cognitive function appears preserved'
      });
    }

    // Language complexity analysis
    const languageFeatures = ['lexicalDiversity', 'syntacticComplexity', 'vocabularySize'];
    const languageImpact = languageFeatures
      .filter(feature => attributions[feature])
      .reduce((sum, feature) => sum + attributions[feature].absoluteImportance, 0);

    if (languageImpact > 0.2) {
      relevance.push({
        domain: 'language_function',
        message: 'Language complexity features significantly influenced the prediction',
        clinicalSignificance: 'high',
        recommendation: 'Language abilities are a key factor in this assessment'
      });
    }

    // Speech fluency analysis
    if (attributions.hesitationRatio && attributions.hesitationRatio.absoluteImportance > 0.05) {
      const hesitationImpact = attributions.hesitationRatio;
      relevance.push({
        domain: 'speech_fluency',
        message: `Speech hesitation patterns ${hesitationImpact.direction === 'negative' ? 'raised concerns' : 'appeared normal'}`,
        clinicalSignificance: hesitationImpact.absoluteImportance > 0.1 ? 'high' : 'moderate',
        recommendation: hesitationImpact.direction === 'negative' ? 'Consider speech-language evaluation' : 'Speech fluency within expected range'
      });
    }

    return relevance;
  }

  /**
   * Generate explainability-based recommendations
   */
  generateExplainabilityRecommendations(attributions, prediction) {
    const recommendations = [];

    // Feature-specific recommendations
    const topNegativeFeatures = Object.entries(attributions)
      .filter(([, attr]) => attr.direction === 'negative')
      .sort(([,a], [,b]) => b.absoluteImportance - a.absoluteImportance)
      .slice(0, 3);

    for (const [featureName, attribution] of topNegativeFeatures) {
      if (attribution.percentageContribution > 10) {
        recommendations.push({
          type: 'feature_improvement',
          feature: featureName,
          message: `Focus on improving ${featureName} as it significantly impacted the assessment`,
          priority: attribution.percentageContribution > 20 ? 'high' : 'medium',
          actionItems: this.getFeatureImprovementActions(featureName)
        });
      }
    }

    // Model confidence recommendations
    if (prediction.confidence < 0.7) {
      recommendations.push({
        type: 'confidence_improvement',
        message: 'Consider providing more comprehensive data to improve prediction confidence',
        priority: 'medium',
        actionItems: [
          'Ensure all feature categories are represented',
          'Provide longer text samples for analysis',
          'Consider multiple assessment sessions'
        ]
      });
    }

    // Follow-up recommendations based on SHAP insights
    const highImpactFeatures = Object.entries(attributions)
      .filter(([, attr]) => attr.percentageContribution > 15)
      .length;

    if (highImpactFeatures < 3) {
      recommendations.push({
        type: 'assessment_depth',
        message: 'Consider more comprehensive assessment to capture additional cognitive domains',
        priority: 'low',
        actionItems: [
          'Include additional cognitive tasks',
          'Assess multiple language modalities',
          'Consider longitudinal assessment'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Get feature improvement actions
   */
  getFeatureImprovementActions(featureName) {
    const actions = {
      cognitiveHealthScore: [
        'Engage in regular cognitive exercises',
        'Maintain social interactions',
        'Consider cognitive training programs'
      ],
      lexicalDiversity: [
        'Read diverse materials regularly',
        'Practice vocabulary expansion exercises',
        'Engage in varied conversations'
      ],
      syntacticComplexity: [
        'Practice complex sentence construction',
        'Read literature with varied sentence structures',
        'Engage in structured writing exercises'
      ],
      hesitationRatio: [
        'Practice speech fluency exercises',
        'Consider speech therapy if needed',
        'Work on word retrieval strategies'
      ],
      vocabularySize: [
        'Read regularly and widely',
        'Learn new words daily',
        'Use vocabulary in conversation'
      ]
    };

    return actions[featureName] || [
      'Consult with healthcare provider for specific guidance',
      'Consider targeted cognitive training',
      'Monitor changes over time'
    ];
  }

  /**
   * Validate explanation inputs
   */
  validateExplanationInputs(features, prediction, options) {
    const errors = [];

    // Validate features
    if (!features || typeof features !== 'object') {
      errors.push('Features must be a valid object');
    }

    // Validate prediction
    if (!prediction || typeof prediction !== 'object') {
      errors.push('Prediction must be a valid object');
    } else {
      if (typeof prediction.riskScore !== 'number') {
        errors.push('Prediction must include a valid riskScore');
      }
    }

    // Validate options
    if (options.types && !Array.isArray(options.types)) {
      errors.push('Explanation types must be an array');
    }

    if (options.types) {
      const invalidTypes = options.types.filter(type => !this.explanationTypes[type]);
      if (invalidTypes.length > 0) {
        errors.push(`Invalid explanation types: ${invalidTypes.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare data for SHAP analysis
   */
  prepareShapData(features, prediction, options) {
    // Flatten nested feature structure
    const flatFeatures = {};
    
    for (const [category, categoryFeatures] of Object.entries(features)) {
      if (typeof categoryFeatures === 'object' && categoryFeatures !== null) {
        for (const [featureName, value] of Object.entries(categoryFeatures)) {
          flatFeatures[featureName] = value;
        }
      }
    }

    return {
      features: flatFeatures,
      prediction: {
        riskScore: prediction.riskScore,
        confidence: prediction.confidence,
        scoringId: prediction.scoringId || prediction.analysisId
      },
      metadata: {
        timestamp: new Date().toISOString(),
        featureCount: Object.keys(flatFeatures).length
      }
    };
  }

  /**
   * Get feature category
   */
  getFeatureCategory(featureName) {
    for (const [categoryName, category] of Object.entries(this.featureCategories)) {
      if (category.features.includes(featureName)) {
        return {
          name: categoryName,
          displayName: category.name,
          color: category.color
        };
      }
    }
    
    return {
      name: 'other',
      displayName: 'Other Features',
      color: '#6B7280'
    };
  }

  /**
   * Interpret SHAP value for a feature
   */
  interpretShapValue(featureName, shapValue) {
    const absValue = Math.abs(shapValue);
    const direction = shapValue > 0 ? 'increased' : 'decreased';
    const magnitude = absValue > 0.1 ? 'significantly' : absValue > 0.05 ? 'moderately' : 'slightly';
    
    return `This feature ${magnitude} ${direction} the cognitive health score by ${absValue.toFixed(3)} points`;
  }

  /**
   * Calculate global importance across features
   */
  calculateGlobalImportance(attributions) {
    const importance = {};
    
    for (const [featureName, attribution] of Object.entries(attributions)) {
      importance[featureName] = {
        meanAbsoluteShap: attribution.absoluteImportance,
        percentageContribution: attribution.percentageContribution,
        rank: 0 // Will be set after sorting
      };
    }

    // Assign ranks
    const sortedFeatures = Object.entries(importance)
      .sort(([,a], [,b]) => b.meanAbsoluteShap - a.meanAbsoluteShap);
    
    sortedFeatures.forEach(([featureName], index) => {
      importance[featureName].rank = index + 1;
    });

    return importance;
  }

  /**
   * Generate local explanation for this specific prediction
   */
  generateLocalExplanation(attributions, features) {
    const explanation = {
      summary: '',
      details: [],
      featureValues: {}
    };

    // Feature values with their impacts
    for (const [featureName, attribution] of Object.entries(attributions)) {
      const featureValue = this.getFeatureValue(featureName, features);
      explanation.featureValues[featureName] = {
        value: featureValue,
        shapValue: attribution.shapValue,
        impact: attribution.direction,
        interpretation: attribution.interpretation
      };
    }

    // Generate summary
    const topFeatures = Object.entries(attributions)
      .sort(([,a], [,b]) => b.absoluteImportance - a.absoluteImportance)
      .slice(0, 3)
      .map(([name]) => name);

    explanation.summary = `This prediction was primarily influenced by ${topFeatures.join(', ')}. ` +
      `The model's decision was based on the specific values of these features in this sample.`;

    return explanation;
  }

  /**
   * Analyze feature interactions
   */
  analyzeFeatureInteractions(shapResults) {
    // Simplified interaction analysis
    // In a full implementation, this would use SHAP interaction values
    return {
      hasInteractions: false,
      interactions: [],
      message: 'Feature interaction analysis requires additional SHAP computation'
    };
  }

  /**
   * Analyze prediction uncertainty
   */
  analyzeUncertainty(shapResults, prediction) {
    const uncertainty = {
      confidence: prediction.confidence,
      uncertaintyLevel: prediction.confidence > 0.8 ? 'low' : prediction.confidence > 0.6 ? 'moderate' : 'high',
      sources: [],
      recommendations: []
    };

    if (prediction.confidence < 0.7) {
      uncertainty.sources.push('Limited feature completeness');
      uncertainty.recommendations.push('Provide more comprehensive feature data');
    }

    if (shapResults.modelType === 'fallback') {
      uncertainty.sources.push('Using fallback model instead of primary ensemble');
      uncertainty.recommendations.push('Ensure primary ML models are available');
    }

    return uncertainty;
  }

  /**
   * Get feature value from nested structure
   */
  getFeatureValue(featureName, features) {
    for (const categoryFeatures of Object.values(features)) {
      if (typeof categoryFeatures === 'object' && categoryFeatures[featureName] !== undefined) {
        return categoryFeatures[featureName];
      }
    }
    return null;
  }

  /**
   * Save explanation for future reference
   */
  async saveExplanation(explanation) {
    try {
      const filename = `explanation_${explanation.explanationId}_${Date.now()}.json`;
      const filepath = path.join(this.explanationsPath, filename);
      await fs.writeJson(filepath, explanation, { spaces: 2 });
    } catch (error) {
      console.warn('Failed to save explanation:', error.message);
      // Don't throw error - this is just for audit trail
    }
  }

  /**
   * Get explanation by ID
   */
  async getExplanation(explanationId) {
    try {
      const glob = require('glob');
      const pattern = path.join(this.explanationsPath, `explanation_${explanationId}_*.json`);
      const files = glob.sync(pattern);
      
      if (files.length === 0) {
        throw new Error('Explanation not found');
      }

      return await fs.readJson(files[0]);
    } catch (error) {
      throw new Error(`Failed to retrieve explanation: ${error.message}`);
    }
  }

  /**
   * Get available explanation types
   */
  getExplanationTypes() {
    return this.explanationTypes;
  }

  /**
   * Get service health
   */
  async getHealth() {
    try {
      // Check if Python and required packages are available
      const healthCheck = await this.checkPythonEnvironment();
      
      return {
        status: healthCheck.available ? 'healthy' : 'degraded',
        capabilities: {
          shapGeneration: healthCheck.available,
          visualizationGeneration: healthCheck.available,
          featureAttribution: true,
          clinicalInterpretation: true
        },
        pythonEnvironment: healthCheck,
        supportedTypes: Object.keys(this.explanationTypes),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check Python environment for SHAP
   */
  async checkPythonEnvironment() {
    return new Promise((resolve) => {
      const pythonOptions = {
        mode: 'json',
        pythonPath: process.env.PYTHON_PATH || 'python3',
        scriptPath: this.scriptsPath,
        args: ['--health-check']
      };

      PythonShell.run('shap_explainer.py', pythonOptions, (err, results) => {
        if (err) {
          resolve({
            available: false,
            error: err.message,
            packages: { shap: false, matplotlib: false, pandas: false }
          });
          return;
        }

        try {
          const result = results[0];
          resolve(result);
        } catch (parseError) {
          resolve({
            available: false,
            error: 'Failed to parse health check result',
            packages: { shap: false, matplotlib: false, pandas: false }
          });
        }
      });
    });
  }
}

module.exports = new ExplainabilityService();
