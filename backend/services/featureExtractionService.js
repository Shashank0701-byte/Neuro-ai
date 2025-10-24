const { PythonShell } = require('python-shell');
const natural = require('natural');
const compromise = require('compromise');
const sentiment = require('sentiment');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FeatureExtractionService {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.spacyModel = process.env.SPACY_MODEL || 'en_core_web_sm';
    this.featuresDir = process.env.FEATURES_DIR || './data/features';
    this.enableAdvancedNLP = process.env.ENABLE_ADVANCED_NLP === 'true';
    this.cognitiveAnalysisEnabled = process.env.COGNITIVE_ANALYSIS_ENABLED === 'true';
    
    // Initialize sentiment analyzer
    this.sentimentAnalyzer = new sentiment();
    
    // Initialize directories
    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      await fs.ensureDir(this.featuresDir);
      await fs.ensureDir(path.join(this.featuresDir, 'cache'));
    } catch (error) {
      console.error('Error creating feature directories:', error);
    }
  }

  /**
   * Extract comprehensive features from text
   * @param {string} text - Input text to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Extracted features
   */
  async extractFeatures(text, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Invalid or empty text provided');
      }

      const analysisId = uuidv4();
      console.log(`Starting feature extraction: ${analysisId}`);

      // Prepare analysis data
      const analysisData = {
        id: analysisId,
        timestamp: new Date().toISOString(),
        text: text.trim(),
        options,
        processingTime: 0,
        status: 'processing'
      };

      // Extract features using multiple approaches
      const features = await this._extractAllFeatures(text, options);

      // Calculate processing time
      const processingTime = (Date.now() - startTime) / 1000;

      // Compile final result
      const result = {
        ...analysisData,
        features,
        processingTime,
        status: 'completed',
        metadata: {
          textLength: text.length,
          wordCount: this._countWords(text),
          sentenceCount: this._countSentences(text),
          analysisTimestamp: new Date().toISOString(),
          enabledFeatures: this._getEnabledFeatures()
        }
      };

      // Save analysis result
      await this.saveAnalysis(result);

      return result;

    } catch (error) {
      console.error('Feature extraction error:', error);
      
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
   * Extract features from transcription data
   * @param {Object} transcription - Transcription object with text and metadata
   * @returns {Promise<Object>} Extracted features
   */
  async extractFromTranscription(transcription) {
    try {
      if (!transcription || !transcription.result || !transcription.result.text) {
        throw new Error('Invalid transcription data');
      }

      const text = transcription.result.text;
      const metadata = {
        transcriptionId: transcription.id,
        duration: transcription.result.duration,
        confidence: transcription.confidence,
        language: transcription.result.language,
        segments: transcription.result.segments,
        words: transcription.result.words
      };

      const options = {
        includeTimingFeatures: true,
        includeSpeechPatterns: true,
        metadata
      };

      return await this.extractFeatures(text, options);

    } catch (error) {
      console.error('Transcription feature extraction error:', error);
      throw error;
    }
  }

  /**
   * Extract all feature categories
   * @private
   */
  async _extractAllFeatures(text, options = {}) {
    const features = {};

    // Basic JavaScript-based features (always available)
    features.basic = await this._extractBasicFeatures(text);
    features.lexical = await this._extractLexicalFeatures(text);
    features.sentiment = await this._extractSentimentFeatures(text);
    features.readability = await this._extractReadabilityFeatures(text);

    // Advanced features using compromise.js
    features.linguistic = await this._extractLinguisticFeatures(text);
    features.discourse = await this._extractDiscourseFeatures(text);

    // Speech-specific features (if timing data available)
    if (options.includeTimingFeatures && options.metadata) {
      features.speech = await this._extractSpeechFeatures(text, options.metadata);
    }

    // Advanced NLP features using Python/spaCy (if enabled)
    if (this.enableAdvancedNLP) {
      try {
        features.advanced = await this._extractAdvancedNLPFeatures(text, options.metadata);
      } catch (error) {
        console.warn('Advanced NLP features unavailable:', error.message);
        features.advanced = { error: 'Advanced NLP unavailable', message: error.message };
      }
    }

    // Cognitive health indicators (if enabled)
    if (this.cognitiveAnalysisEnabled) {
      features.cognitive = await this._extractCognitiveFeatures(text, features);
    }

    return features;
  }

  /**
   * Extract basic text features
   * @private
   */
  async _extractBasicFeatures(text) {
    const words = this._getWords(text);
    const sentences = this._getSentences(text);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    return {
      characterCount: characters,
      characterCountNoSpaces: charactersNoSpaces,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: text.split(/\n\s*\n/).length,
      averageWordsPerSentence: words.length / sentences.length || 0,
      averageCharactersPerWord: charactersNoSpaces / words.length || 0,
      averageSentenceLength: characters / sentences.length || 0
    };
  }

  /**
   * Extract lexical features
   * @private
   */
  async _extractLexicalFeatures(text) {
    const words = this._getWords(text);
    const wordFreq = this._getWordFrequency(words);
    const uniqueWords = Object.keys(wordFreq).length;
    
    // Type-Token Ratio
    const ttr = uniqueWords / words.length || 0;
    
    // Hapax Legomena (words that appear only once)
    const hapaxLegomena = Object.values(wordFreq).filter(freq => freq === 1).length;
    const hapaxRatio = hapaxLegomena / words.length || 0;

    // Word length analysis
    const wordLengths = words.map(word => word.length);
    const avgWordLength = wordLengths.reduce((sum, len) => sum + len, 0) / wordLengths.length || 0;
    
    // Complex words (>6 characters)
    const complexWords = words.filter(word => word.length > 6).length;
    const complexWordRatio = complexWords / words.length || 0;

    return {
      vocabularySize: uniqueWords,
      typeTokenRatio: ttr,
      hapaxLegomena,
      hapaxRatio,
      averageWordLength: avgWordLength,
      complexWords,
      complexWordRatio,
      mostFrequentWords: Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [word, freq]) => ({ ...obj, [word]: freq }), {}),
      wordLengthDistribution: this._getWordLengthDistribution(wordLengths)
    };
  }

  /**
   * Extract sentiment features
   * @private
   */
  async _extractSentimentFeatures(text) {
    const result = this.sentimentAnalyzer.analyze(text);
    
    return {
      sentimentScore: result.score,
      comparativeScore: result.comparative,
      positiveWords: result.positive,
      negativeWords: result.negative,
      positiveCount: result.positive.length,
      negativeCount: result.negative.length,
      sentimentPolarity: this._classifySentiment(result.comparative)
    };
  }

  /**
   * Extract readability features
   * @private
   */
  async _extractReadabilityFeatures(text) {
    const words = this._getWords(text);
    const sentences = this._getSentences(text);
    const syllables = this._countSyllables(text);
    
    // Flesch Reading Ease approximation
    const avgSentenceLength = words.length / sentences.length || 0;
    const avgSyllablesPerWord = syllables / words.length || 0;
    
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Automated Readability Index approximation
    const characters = text.replace(/\s/g, '').length;
    const ariScore = (4.71 * (characters / words.length)) + (0.5 * avgSentenceLength) - 21.43;

    return {
      fleschReadingEase: Math.max(0, Math.min(100, fleschScore)),
      automatedReadabilityIndex: Math.max(0, ariScore),
      averageSentenceLength: avgSentenceLength,
      averageSyllablesPerWord: avgSyllablesPerWord,
      readabilityLevel: this._classifyReadability(fleschScore)
    };
  }

  /**
   * Extract linguistic features using compromise.js
   * @private
   */
  async _extractLinguisticFeatures(text) {
    const doc = compromise(text);
    
    // Part-of-speech analysis
    const nouns = doc.nouns().out('array');
    const verbs = doc.verbs().out('array');
    const adjectives = doc.adjectives().out('array');
    const adverbs = doc.adverbs().out('array');
    
    const totalWords = this._getWords(text).length;
    
    return {
      nounCount: nouns.length,
      verbCount: verbs.length,
      adjectiveCount: adjectives.length,
      adverbCount: adverbs.length,
      nounRatio: nouns.length / totalWords || 0,
      verbRatio: verbs.length / totalWords || 0,
      adjectiveRatio: adjectives.length / totalWords || 0,
      adverbRatio: adverbs.length / totalWords || 0,
      contentWordRatio: (nouns.length + verbs.length + adjectives.length + adverbs.length) / totalWords || 0,
      namedEntities: this._extractNamedEntities(doc),
      questionCount: doc.questions().out('array').length,
      exclamationCount: (text.match(/!/g) || []).length
    };
  }

  /**
   * Extract discourse features
   * @private
   */
  async _extractDiscourseFeatures(text) {
    const sentences = this._getSentences(text);
    
    // Discourse markers
    const discourseMarkers = [
      'however', 'therefore', 'moreover', 'furthermore', 'nevertheless',
      'consequently', 'meanwhile', 'additionally', 'similarly', 'conversely',
      'first', 'second', 'finally', 'in conclusion', 'for example'
    ];
    
    const markerCount = discourseMarkers.reduce((count, marker) => {
      return count + (text.toLowerCase().match(new RegExp(`\\b${marker}\\b`, 'g')) || []).length;
    }, 0);

    // Cohesion indicators
    const pronouns = (text.match(/\b(he|she|it|they|this|that|these|those)\b/gi) || []).length;
    const conjunctions = (text.match(/\b(and|but|or|so|because|although|while|since)\b/gi) || []).length;

    return {
      discourseMarkers: markerCount,
      discourseMarkerRatio: markerCount / sentences.length || 0,
      pronounCount: pronouns,
      pronounRatio: pronouns / this._getWords(text).length || 0,
      conjunctionCount: conjunctions,
      cohesionScore: (pronouns + conjunctions + markerCount) / sentences.length || 0
    };
  }

  /**
   * Extract speech-specific features
   * @private
   */
  async _extractSpeechFeatures(text, metadata) {
    const features = {
      duration: metadata.duration || 0,
      confidence: metadata.confidence || 0,
      language: metadata.language || 'unknown'
    };

    if (metadata.duration && metadata.duration > 0) {
      const wordCount = this._getWords(text).length;
      features.speechRate = wordCount / metadata.duration; // words per second
      features.wordsPerMinute = (wordCount / metadata.duration) * 60;
    }

    // Analyze segments if available
    if (metadata.segments && Array.isArray(metadata.segments)) {
      features.segmentAnalysis = this._analyzeSegments(metadata.segments);
    }

    // Analyze word-level timing if available
    if (metadata.words && Array.isArray(metadata.words)) {
      features.wordTimingAnalysis = this._analyzeWordTiming(metadata.words);
    }

    // Detect hesitation markers
    features.hesitationMarkers = this._detectHesitationMarkers(text);

    return features;
  }

  /**
   * Extract advanced NLP features using Python/spaCy
   * @private
   */
  async _extractAdvancedNLPFeatures(text, metadata = {}) {
    return new Promise((resolve, reject) => {
      const inputData = {
        text,
        metadata,
        spacy_model: this.spacyModel
      };

      const options = {
        mode: 'text',
        pythonPath: this.pythonPath,
        scriptPath: path.join(__dirname, '..', 'scripts'),
        args: [JSON.stringify(inputData)]
      };

      PythonShell.run('nlp_analyzer.py', options, (err, results) => {
        if (err) {
          console.error('Python NLP analysis error:', err);
          reject(new Error(`Advanced NLP analysis failed: ${err.message}`));
          return;
        }

        try {
          const result = JSON.parse(results[0]);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse NLP results: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Extract cognitive health features
   * @private
   */
  async _extractCognitiveFeatures(text, allFeatures) {
    const cognitiveIndicators = {
      // Language complexity indicators
      syntacticComplexity: this._assessSyntacticComplexity(text),
      lexicalDiversity: allFeatures.lexical?.typeTokenRatio || 0,
      semanticFluency: this._assessSemanticFluency(text),
      
      // Speech fluency indicators
      hesitationRatio: this._calculateHesitationRatio(text),
      repetitionScore: this._calculateRepetitionScore(text),
      
      // Information content
      informationDensity: this._calculateInformationDensity(text, allFeatures),
      
      // Overall cognitive health score
      cognitiveHealthScore: 0 // Will be calculated below
    };

    // Calculate overall cognitive health score
    cognitiveIndicators.cognitiveHealthScore = this._calculateCognitiveHealthScore(cognitiveIndicators);

    return cognitiveIndicators;
  }

  // Helper methods
  _getWords(text) {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }

  _getSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  _countWords(text) {
    return this._getWords(text).length;
  }

  _countSentences(text) {
    return this._getSentences(text).length;
  }

  _getWordFrequency(words) {
    return words.reduce((freq, word) => {
      freq[word] = (freq[word] || 0) + 1;
      return freq;
    }, {});
  }

  _getWordLengthDistribution(wordLengths) {
    const distribution = {};
    wordLengths.forEach(length => {
      distribution[length] = (distribution[length] || 0) + 1;
    });
    return distribution;
  }

  _countSyllables(text) {
    const words = this._getWords(text);
    return words.reduce((total, word) => {
      return total + this._syllableCount(word);
    }, 0);
  }

  _syllableCount(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  _classifySentiment(score) {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  _classifyReadability(fleschScore) {
    if (fleschScore >= 90) return 'very_easy';
    if (fleschScore >= 80) return 'easy';
    if (fleschScore >= 70) return 'fairly_easy';
    if (fleschScore >= 60) return 'standard';
    if (fleschScore >= 50) return 'fairly_difficult';
    if (fleschScore >= 30) return 'difficult';
    return 'very_difficult';
  }

  _extractNamedEntities(doc) {
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const organizations = doc.organizations().out('array');
    
    return {
      people: people.length,
      places: places.length,
      organizations: organizations.length,
      total: people.length + places.length + organizations.length
    };
  }

  _analyzeSegments(segments) {
    const segmentLengths = segments.map(seg => seg.end - seg.start);
    const avgSegmentLength = segmentLengths.reduce((sum, len) => sum + len, 0) / segmentLengths.length || 0;
    
    return {
      segmentCount: segments.length,
      averageSegmentLength: avgSegmentLength,
      segmentLengthVariation: this._calculateVariation(segmentLengths)
    };
  }

  _analyzeWordTiming(words) {
    const wordDurations = words.map(word => word.end - word.start);
    const avgWordDuration = wordDurations.reduce((sum, dur) => sum + dur, 0) / wordDurations.length || 0;
    
    return {
      averageWordDuration: avgWordDuration,
      wordDurationVariation: this._calculateVariation(wordDurations),
      totalWords: words.length
    };
  }

  _detectHesitationMarkers(text) {
    const hesitationWords = ['um', 'uh', 'er', 'ah', 'hmm', 'well', 'like', 'you know'];
    const hesitationCount = hesitationWords.reduce((count, word) => {
      return count + (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);

    return {
      count: hesitationCount,
      ratio: hesitationCount / this._getWords(text).length || 0,
      types: hesitationWords.filter(word => 
        text.toLowerCase().includes(word)
      )
    };
  }

  _assessSyntacticComplexity(text) {
    const sentences = this._getSentences(text);
    const words = this._getWords(text);
    
    // Simple complexity measures
    const avgWordsPerSentence = words.length / sentences.length || 0;
    const complexSentences = sentences.filter(s => s.split(',').length > 2).length;
    
    return {
      averageWordsPerSentence: avgWordsPerSentence,
      complexSentenceRatio: complexSentences / sentences.length || 0,
      complexityScore: Math.min(1, avgWordsPerSentence / 20) // Normalized to 0-1
    };
  }

  _assessSemanticFluency(text) {
    const doc = compromise(text);
    const nouns = doc.nouns().out('array');
    const uniqueNouns = [...new Set(nouns.map(n => n.toLowerCase()))];
    
    return {
      semanticDiversity: uniqueNouns.length / nouns.length || 0,
      categoryFluency: this._calculateCategoryFluency(uniqueNouns)
    };
  }

  _calculateHesitationRatio(text) {
    const hesitationMarkers = this._detectHesitationMarkers(text);
    return hesitationMarkers.ratio;
  }

  _calculateRepetitionScore(text) {
    const words = this._getWords(text);
    const wordFreq = this._getWordFrequency(words);
    const repeatedWords = Object.values(wordFreq).filter(freq => freq > 1).length;
    
    return repeatedWords / Object.keys(wordFreq).length || 0;
  }

  _calculateInformationDensity(text, allFeatures) {
    const contentWords = (allFeatures.linguistic?.nounCount || 0) + 
                        (allFeatures.linguistic?.verbCount || 0) + 
                        (allFeatures.linguistic?.adjectiveCount || 0);
    const totalWords = allFeatures.basic?.wordCount || 1;
    
    return contentWords / totalWords;
  }

  _calculateCognitiveHealthScore(indicators) {
    // Weighted combination of cognitive indicators
    const weights = {
      syntacticComplexity: 0.2,
      lexicalDiversity: 0.25,
      semanticFluency: 0.2,
      hesitationRatio: -0.15, // Negative weight (lower is better)
      repetitionScore: -0.1,  // Negative weight
      informationDensity: 0.2
    };

    let score = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      if (indicators[key] !== undefined) {
        const value = typeof indicators[key] === 'object' ? 
          indicators[key].complexityScore || indicators[key].semanticDiversity || 0 : 
          indicators[key];
        
        score += value * weight;
        totalWeight += Math.abs(weight);
      }
    });

    // Normalize to 0-1 scale
    return Math.max(0, Math.min(1, (score + totalWeight/2) / totalWeight));
  }

  _calculateVariation(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  _calculateCategoryFluency(nouns) {
    // Simple categorization for demonstration
    const categories = {
      people: ['person', 'man', 'woman', 'child', 'people'],
      places: ['house', 'home', 'city', 'country', 'place'],
      things: ['car', 'book', 'phone', 'computer', 'thing']
    };

    const categoryCount = {};
    Object.keys(categories).forEach(cat => categoryCount[cat] = 0);

    nouns.forEach(noun => {
      Object.entries(categories).forEach(([category, words]) => {
        if (words.some(word => noun.includes(word))) {
          categoryCount[category]++;
        }
      });
    });

    return categoryCount;
  }

  _getEnabledFeatures() {
    return {
      basic: true,
      lexical: true,
      sentiment: true,
      readability: true,
      linguistic: true,
      discourse: true,
      advanced: this.enableAdvancedNLP,
      cognitive: this.cognitiveAnalysisEnabled
    };
  }

  /**
   * Save analysis result to storage
   */
  async saveAnalysis(analysis) {
    try {
      const filePath = path.join(this.featuresDir, `${analysis.id}.json`);
      await fs.writeJson(filePath, analysis, { spaces: 2 });
      console.log(`Feature analysis saved: ${analysis.id}`);
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysis(analysisId) {
    try {
      const filePath = path.join(this.featuresDir, `${analysisId}.json`);
      
      if (await fs.pathExists(filePath)) {
        return await fs.readJson(filePath);
      }
      
      return null;
    } catch (error) {
      console.error('Error reading analysis:', error);
      return null;
    }
  }

  /**
   * Get all analyses with pagination
   */
  async getAnalyses(options = {}) {
    try {
      const { page = 1, limit = 10, status, dateFrom, dateTo } = options;
      
      const files = await fs.readdir(this.featuresDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      let analyses = [];
      
      for (const file of jsonFiles) {
        try {
          const analysis = await fs.readJson(path.join(this.featuresDir, file));
          
          // Apply filters
          if (status && analysis.status !== status) continue;
          if (dateFrom && new Date(analysis.timestamp) < new Date(dateFrom)) continue;
          if (dateTo && new Date(analysis.timestamp) > new Date(dateTo)) continue;
          
          analyses.push(analysis);
        } catch (error) {
          console.error(`Error reading analysis file ${file}:`, error);
        }
      }
      
      // Sort by timestamp (newest first)
      analyses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAnalyses = analyses.slice(startIndex, endIndex);
      
      return {
        analyses: paginatedAnalyses,
        pagination: {
          page,
          limit,
          total: analyses.length,
          pages: Math.ceil(analyses.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting analyses:', error);
      return { analyses: [], pagination: { page: 1, limit, total: 0, pages: 0 } };
    }
  }

  /**
   * Delete analysis
   */
  async deleteAnalysis(analysisId) {
    try {
      const filePath = path.join(this.featuresDir, `${analysisId}.json`);
      
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        console.log(`Analysis deleted: ${analysisId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting analysis:', error);
      return false;
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      const status = {
        status: 'healthy',
        features: this._getEnabledFeatures(),
        timestamp: new Date().toISOString()
      };

      // Test Python/spaCy if enabled
      if (this.enableAdvancedNLP) {
        try {
          await this._extractAdvancedNLPFeatures('Test sentence for health check.');
          status.advancedNLP = 'available';
        } catch (error) {
          status.advancedNLP = 'unavailable';
          status.advancedNLPError = error.message;
          status.status = 'degraded';
        }
      }

      return status;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new FeatureExtractionService();
