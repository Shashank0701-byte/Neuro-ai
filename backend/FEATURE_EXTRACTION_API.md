# Feature Extraction API Documentation

A comprehensive REST API for extracting NLP features from text using advanced linguistic analysis, including syntax complexity, vocabulary diversity, speech patterns, and cognitive health indicators.

## 🚀 Features

- **Multi-level Analysis**: Basic statistics, lexical features, syntactic complexity, semantic analysis
- **Cognitive Health Indicators**: Speech fluency, hesitation patterns, information density
- **Advanced NLP**: spaCy/NLTK integration for deep linguistic analysis
- **Speech Pattern Analysis**: Timing features, speech rate, articulation complexity
- **Sentiment Analysis**: Emotional indicators and sentiment scoring
- **Readability Metrics**: Multiple readability formulas and complexity measures
- **Comparison Tools**: Multi-analysis comparison and trend analysis
- **Real-time Processing**: Fast feature extraction with caching

## 📋 Base URL

```
http://localhost:5000/api/feature-extraction
```

## 🔧 Environment Configuration

Add these variables to your `.env` file:

```env
# Feature Extraction Configuration
PYTHON_PATH=python3
SPACY_MODEL=en_core_web_sm
FEATURES_DIR=./data/features
ENABLE_ADVANCED_NLP=true
COGNITIVE_ANALYSIS_ENABLED=true
```

## 📚 API Endpoints

### 1. Analyze Text

**POST** `/analyze`

Extract comprehensive NLP features from text.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "text": "Your text to analyze here...",
  "options": {
    "includeAdvanced": true,
    "includeCognitive": true,
    "language": "en",
    "analysisType": "comprehensive"
  }
}
```

#### Parameters

- `text` (string, required): Text to analyze (max 50,000 characters)
- `options` (object, optional): Analysis configuration
  - `includeAdvanced` (boolean): Include advanced spaCy/NLTK features
  - `includeCognitive` (boolean): Include cognitive health analysis
  - `language` (string): Language code (default: 'en')
  - `analysisType` (string): Analysis depth ('basic', 'comprehensive', 'cognitive')

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Feature extraction completed successfully",
  "data": {
    "analysisId": "uuid-string",
    "features": {
      "basic": {
        "characterCount": 150,
        "wordCount": 25,
        "sentenceCount": 3,
        "averageWordsPerSentence": 8.33,
        "averageCharactersPerWord": 5.2,
        "typeTokenRatio": 0.84
      },
      "lexical": {
        "vocabularySize": 21,
        "lexicalDiversity": 0.84,
        "hapaxLegomena": 18,
        "hapaxRatio": 0.72,
        "averageWordLength": 5.2,
        "complexWords": 3,
        "complexWordRatio": 0.12,
        "mostFrequentWords": {
          "the": 2,
          "and": 2,
          "text": 1
        }
      },
      "sentiment": {
        "sentimentScore": 2,
        "comparativeScore": 0.08,
        "positiveWords": ["good", "excellent"],
        "negativeWords": [],
        "sentimentPolarity": "positive"
      },
      "readability": {
        "fleschReadingEase": 65.2,
        "automatedReadabilityIndex": 8.5,
        "averageSentenceLength": 8.33,
        "averageSyllablesPerWord": 1.6,
        "readabilityLevel": "standard"
      },
      "linguistic": {
        "nounCount": 8,
        "verbCount": 4,
        "adjectiveCount": 3,
        "adverbCount": 1,
        "nounRatio": 0.32,
        "verbRatio": 0.16,
        "contentWordRatio": 0.64,
        "namedEntities": {
          "people": 1,
          "places": 0,
          "organizations": 0,
          "total": 1
        }
      },
      "discourse": {
        "discourseMarkers": 2,
        "discourseMarkerRatio": 0.67,
        "pronounCount": 3,
        "pronounRatio": 0.12,
        "conjunctionCount": 2,
        "cohesionScore": 2.33
      },
      "cognitive": {
        "syntacticComplexity": {
          "averageWordsPerSentence": 8.33,
          "complexSentenceRatio": 0.33,
          "complexityScore": 0.42
        },
        "lexicalDiversity": 0.84,
        "semanticFluency": {
          "semanticDiversity": 0.95,
          "categoryFluency": {
            "people": 1,
            "places": 0,
            "things": 2
          }
        },
        "hesitationRatio": 0.02,
        "repetitionScore": 0.08,
        "informationDensity": 0.64,
        "cognitiveHealthScore": 0.78
      }
    },
    "processingTime": 1.23,
    "metadata": {
      "textLength": 150,
      "wordCount": 25,
      "sentenceCount": 3,
      "analysisTimestamp": "2024-01-01T12:00:00.000Z"
    }
  },
  "summary": {
    "textComplexity": "moderate",
    "readabilityLevel": "standard",
    "sentimentPolarity": "positive",
    "cognitiveHealthScore": 0.78,
    "keyInsights": [
      "Text readability: standard",
      "Overall sentiment: positive",
      "Cognitive health indicator: good",
      "Vocabulary diversity: high"
    ]
  },
  "cognitiveInsights": {
    "strengths": [
      "Strong cognitive indicators",
      "Rich vocabulary usage"
    ],
    "concerns": [],
    "recommendations": [],
    "overallAssessment": "good"
  }
}
```

#### Rate Limiting
- **Limit**: 20 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

### 2. Analyze Transcription

**POST** `/analyze-transcription/:transcriptionId`

Extract features from existing speech transcription with timing data.

#### Parameters
- `transcriptionId` (string, required): Speech-to-text transcription UUID

#### Request Body
```json
{
  "options": {
    "includeAdvanced": true,
    "includeCognitive": true,
    "analysisType": "comprehensive"
  }
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Transcription analysis completed successfully",
  "data": {
    "analysisId": "uuid-string",
    "transcriptionId": "transcription-uuid",
    "features": {
      "basic": { /* ... */ },
      "lexical": { /* ... */ },
      "speech": {
        "duration": 45.2,
        "confidence": 0.95,
        "language": "en",
        "speechRate": 2.5,
        "wordsPerMinute": 150,
        "segmentAnalysis": {
          "segmentCount": 8,
          "averageSegmentLength": 5.65,
          "segmentLengthVariation": 2.1
        },
        "wordTimingAnalysis": {
          "averageWordDuration": 0.4,
          "wordDurationVariation": 0.15,
          "totalWords": 113
        },
        "hesitationMarkers": {
          "count": 3,
          "ratio": 0.027,
          "types": ["um", "uh"]
        }
      },
      "cognitive": { /* ... */ }
    }
  },
  "speechInsights": {
    "speechRate": "normal",
    "fluency": "good",
    "articulation": "normal",
    "recommendations": []
  }
}
```

---

### 3. Get Analysis

**GET** `/analyses/:id`

Retrieve a specific analysis by ID.

#### Parameters
- `id` (string, required): Analysis UUID

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "text": "Original analyzed text...",
    "features": { /* ... */ },
    "processingTime": 1.23,
    "status": "completed"
  },
  "summary": { /* ... */ },
  "cognitiveInsights": { /* ... */ }
}
```

---

### 4. List Analyses

**GET** `/analyses`

Get paginated list of analyses with filtering.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (1-100, default: 10)
- `status` (string, optional): Filter by status ('completed', 'failed', 'processing')
- `dateFrom` (string, optional): Filter from date (ISO string)
- `dateTo` (string, optional): Filter to date (ISO string)

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "status": "completed",
      "features": { /* ... */ }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 5. Delete Analysis

**DELETE** `/analyses/:id`

Delete an analysis (Admin only).

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Parameters
- `id` (string, required): Analysis UUID

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Analysis deleted successfully",
  "analysisId": "uuid-string"
}
```

---

### 6. Compare Analyses

**POST** `/compare`

Compare multiple analyses for trends and differences.

#### Request Body
```json
{
  "analysisIds": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ]
}
```

#### Parameters
- `analysisIds` (array, required): Array of 2-10 analysis UUIDs

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Analysis comparison completed",
  "data": {
    "analysisCount": 3,
    "comparison": {
      "metrics": {
        "cognitiveHealthScore": {
          "values": [0.78, 0.82, 0.75],
          "average": 0.783,
          "min": 0.75,
          "max": 0.82,
          "range": 0.07
        },
        "lexicalDiversity": {
          "values": [0.84, 0.89, 0.81],
          "average": 0.847,
          "min": 0.81,
          "max": 0.89,
          "range": 0.08
        }
      }
    },
    "insights": [
      "Cognitive health improvement trend observed",
      "Consistent vocabulary diversity across analyses"
    ]
  }
}
```

---

### 7. Get Statistics

**GET** `/stats`

Get feature extraction usage statistics.

#### Query Parameters
- `dateFrom` (string, optional): Filter from date (ISO string)
- `dateTo` (string, optional): Filter to date (ISO string)

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "completed": 142,
    "failed": 8,
    "averageProcessingTime": 1.45,
    "averageTextLength": 1250,
    "averageWordCount": 185,
    "cognitiveHealthDistribution": {
      "high": 85,
      "medium": 45,
      "low": 12
    },
    "featureDistribution": {
      "basic": 142,
      "lexical": 142,
      "sentiment": 142,
      "cognitive": 128,
      "advanced": 95
    },
    "dateRange": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

---

### 8. Health Check

**GET** `/health`

Check service health and feature availability.

#### Response

**Healthy (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "features": {
      "basic": true,
      "lexical": true,
      "sentiment": true,
      "advanced": true,
      "cognitive": true
    },
    "advancedNLP": "available",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

**Degraded (503):**
```json
{
  "success": false,
  "data": {
    "status": "degraded",
    "features": {
      "basic": true,
      "advanced": false
    },
    "advancedNLP": "unavailable",
    "advancedNLPError": "Python spaCy model not found",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 9. Get Capabilities

**GET** `/capabilities`

Get available features and service capabilities.

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "features": {
      "basic": {
        "description": "Basic text statistics (word count, sentence count, etc.)",
        "available": true
      },
      "lexical": {
        "description": "Lexical diversity and vocabulary analysis",
        "available": true
      },
      "sentiment": {
        "description": "Sentiment analysis and emotional indicators",
        "available": true
      },
      "readability": {
        "description": "Readability scores and complexity measures",
        "available": true
      },
      "linguistic": {
        "description": "Part-of-speech analysis and linguistic patterns",
        "available": true
      },
      "discourse": {
        "description": "Discourse markers and text coherence",
        "available": true
      },
      "speech": {
        "description": "Speech-specific features (timing, rate, hesitations)",
        "available": true,
        "requiresTranscription": true
      },
      "advanced": {
        "description": "Advanced NLP features using spaCy (syntax, semantics)",
        "available": true
      },
      "cognitive": {
        "description": "Cognitive health indicators and scoring",
        "available": true
      }
    },
    "limits": {
      "maxTextLength": 50000,
      "maxComparisons": 10,
      "supportedLanguages": ["en"]
    },
    "requirements": {
      "python": "python3",
      "spacyModel": "en_core_web_sm"
    }
  }
}
```

## 🎯 Feature Categories

### Basic Features
- **Character/Word/Sentence counts**
- **Average lengths and ratios**
- **Type-token ratio (vocabulary diversity)**

### Lexical Features
- **Vocabulary size and diversity**
- **Hapax legomena (unique words)**
- **Word length distribution**
- **Complex word analysis**
- **Most frequent words**

### Syntactic Features (Advanced)
- **Dependency parsing depth**
- **Clause complexity**
- **Passive voice detection**
- **Syntactic tree analysis**

### Semantic Features (Advanced)
- **Named entity recognition**
- **Semantic role labeling**
- **Word sense disambiguation**
- **Semantic similarity**

### Discourse Features
- **Discourse markers**
- **Cohesion indicators**
- **Pronoun usage**
- **Text connectivity**

### Readability Features
- **Flesch Reading Ease**
- **Automated Readability Index**
- **Coleman-Liau Index**
- **Gunning Fog Index**

### Sentiment Features
- **Sentiment polarity and intensity**
- **Emotional valence**
- **Positive/negative word counts**
- **Comparative sentiment scoring**

### Speech Features
- **Speech rate (words per minute)**
- **Pause patterns and timing**
- **Hesitation markers**
- **Articulation complexity**
- **Segment analysis**

### Cognitive Health Indicators
- **Syntactic complexity score**
- **Lexical diversity measures**
- **Information density**
- **Hesitation and repetition patterns**
- **Semantic fluency**
- **Overall cognitive health score**

## 🔒 Security Features

### Rate Limiting
- **Analysis**: 20 requests per 15 minutes
- **General**: 100 requests per 15 minutes
- **Headers**: Rate limit information in response headers

### Input Validation
- **Text length limits** (50,000 characters max)
- **Content sanitization**
- **Parameter validation**
- **JSON schema validation**

### Authentication
- **Admin Routes**: JWT token required for deletion
- **Public Routes**: Open access with rate limiting

## 📊 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input parameters |
| `TEXT_TOO_LONG` | 400 | Text exceeds maximum length |
| `ANALYSIS_NOT_FOUND` | 404 | Analysis ID not found |
| `TRANSCRIPTION_NOT_FOUND` | 404 | Transcription ID not found |
| `INSUFFICIENT_ANALYSES` | 404 | Not enough analyses for comparison |
| `PROCESSING_TIMEOUT` | 408 | Analysis request timed out |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `ADVANCED_NLP_UNAVAILABLE` | 503 | spaCy/NLTK services unavailable |

## 🧪 Testing Examples

### Analyze Text (cURL)

```bash
curl -X POST http://localhost:5000/api/feature-extraction/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a sample text for analysis. It contains multiple sentences with various linguistic patterns.",
    "options": {
      "includeAdvanced": true,
      "includeCognitive": true,
      "analysisType": "comprehensive"
    }
  }'
```

### Get Analysis

```bash
curl -X GET http://localhost:5000/api/feature-extraction/analyses/uuid-string
```

### Compare Analyses

```bash
curl -X POST http://localhost:5000/api/feature-extraction/compare \
  -H "Content-Type: application/json" \
  -d '{
    "analysisIds": ["uuid-1", "uuid-2", "uuid-3"]
  }'
```

### Get Statistics

```bash
curl -X GET "http://localhost:5000/api/feature-extraction/stats?dateFrom=2024-01-01&dateTo=2024-01-31"
```

## 🔄 Integration Examples

### JavaScript/Fetch

```javascript
// Analyze text
const analyzeText = async (text, options = {}) => {
  const response = await fetch('/api/feature-extraction/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, options })
  });
  
  const result = await response.json();
  return result;
};

// Get cognitive insights
const getCognitiveInsights = (features) => {
  const cognitiveScore = features.cognitive?.cognitiveHealthScore || 0;
  const lexicalDiversity = features.lexical?.typeTokenRatio || 0;
  
  return {
    cognitiveHealth: cognitiveScore > 0.7 ? 'good' : 'needs_attention',
    vocabularyRichness: lexicalDiversity > 0.6 ? 'high' : 'moderate'
  };
};
```

### Python/Requests

```python
import requests

def analyze_text(text, options=None):
    """Analyze text using NeuroAid Feature Extraction API"""
    url = 'http://localhost:5000/api/feature-extraction/analyze'
    
    payload = {
        'text': text,
        'options': options or {}
    }
    
    response = requests.post(url, json=payload)
    return response.json()

def get_cognitive_score(analysis_result):
    """Extract cognitive health score from analysis"""
    if analysis_result.get('success'):
        features = analysis_result['data']['features']
        return features.get('cognitive', {}).get('cognitiveHealthScore', 0)
    return 0

# Example usage
text = "This is a sample text for cognitive analysis."
result = analyze_text(text, {
    'includeAdvanced': True,
    'includeCognitive': True
})

cognitive_score = get_cognitive_score(result)
print(f"Cognitive Health Score: {cognitive_score:.2f}")
```

## 🚀 Performance Optimization

### Processing Speed
- **Basic Features**: < 100ms for typical text
- **Advanced Features**: 1-3 seconds with spaCy
- **Caching**: Results cached for repeated analysis
- **Batch Processing**: Multiple texts processed efficiently

### Memory Management
- **Streaming Processing**: Large texts processed in chunks
- **Cleanup**: Automatic cleanup of temporary data
- **Resource Limits**: Configurable memory and time limits

### Scalability
- **Horizontal Scaling**: Multiple worker processes
- **Load Balancing**: Distribute analysis requests
- **Queue Management**: Background processing for large texts

---

**Feature Extraction API** - Advanced NLP analysis for cognitive health assessment and linguistic research.
