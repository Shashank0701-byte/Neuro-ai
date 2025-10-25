# NeuroAid Backend API

A robust Node.js/Express backend API for managing dynamic content in the NeuroAid application, including "How It Works" section and Technical Pipeline visualization.

## 🚀 Features

- **Dynamic Content Management**: Full CRUD operations for "How It Works" section
- **Technical Pipeline API**: Comprehensive API for pipeline module metadata and visualization
- **Speech-to-Text API**: Audio upload, processing, and transcription with Whisper integration
- **Feature Extraction API**: Advanced NLP analysis with spaCy/NLTK for cognitive health assessment
- **Cognitive Model API**: ML-powered risk scoring with confidence metrics and clinical interpretation
- **Explainability API**: SHAP-based model interpretability with visualizations and clinical insights
- **Admin Authentication**: JWT-based authentication with role-based access control
- **Rate Limiting**: Protection against abuse with configurable limits
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: CORS, Helmet, and other security middleware
- **File-based Database**: Simple JSON file storage (easily replaceable with real DB)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Python 3.8+ (for advanced NLP features)
- pip (Python package manager)

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Install Python dependencies (for Feature Extraction):**
   ```bash
   pip install -r requirements.txt
   
   # Download required NLTK data
   python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger'); nltk.download('stopwords'); nltk.download('vader_lexicon'); nltk.download('maxent_ne_chunker'); nltk.download('words')"
   
   # Download spaCy model
   python -m spacy download en_core_web_sm
   ```

4. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `ADMIN_USERNAME` | Default admin username | `admin` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |
| `ADMIN_EMAIL` | Default admin email | `admin@neuroaid.com` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `WHISPER_API_URL` | Whisper API endpoint | `http://localhost:8000` |
| `WHISPER_API_KEY` | Whisper API key | Required for remote API |
| `WHISPER_MODEL` | Default Whisper model | `base` |
| `UPLOAD_MAX_SIZE` | Max file upload size | `52428800` (50MB) |
| `UPLOAD_DIR` | Upload directory | `./uploads` |
| `TRANSCRIPTIONS_DIR` | Transcriptions storage | `./data/transcriptions` |

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST `/auth/login`
Admin login endpoint.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@neuroaid.com",
    "role": "admin",
    "permissions": ["read", "write", "delete", "manage_content"]
  },
  "expiresIn": "24h"
}
```

#### GET `/auth/me`
Get current admin profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/auth/verify`
Verify token validity.

#### POST `/auth/logout`
Logout (client-side token removal).

### How It Works Endpoints

#### GET `/how-it-works`
Get complete "How It Works" content.

**Response:**
```json
{
  "success": true,
  "data": {
    "header": { ... },
    "steps": [ ... ],
    "summary": { ... },
    "validation": { ... }
  },
  "metadata": {
    "lastUpdated": "2024-10-24T14:43:00.000Z",
    "version": "1.0.0",
    "updatedBy": "admin"
  }
}
```

#### GET `/how-it-works/steps`
Get all steps.

#### GET `/how-it-works/steps/:id`
Get specific step by ID.

#### PUT `/how-it-works/steps/:id`
Update specific step (Admin only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 1,
  "icon": "UserCircle",
  "title": "Registration & Setup",
  "shortDesc": "Quick account creation and personalized profile setup",
  "duration": "2 minutes",
  "color": "from-blue-500 to-blue-600",
  "bgColor": "bg-blue-50",
  "borderColor": "border-blue-200",
  "details": {
    "overview": "Begin your cognitive health journey...",
    "substeps": [
      {
        "icon": "UserCircle",
        "title": "Create Account",
        "description": "Sign up with email or social login..."
      }
    ],
    "technicalDetails": [
      "End-to-end encryption for all user data",
      "HIPAA and GDPR compliant data handling"
    ]
  }
}
```

#### POST `/how-it-works/steps`
Add new step (Admin only).

#### DELETE `/how-it-works/steps/:id`
Delete specific step (Admin only).

#### PUT `/how-it-works/header`
Update header content (Admin only).

#### PUT `/how-it-works/summary`
Update summary content (Admin only).

#### PUT `/how-it-works/validation`
Update validation content (Admin only).

#### GET `/how-it-works/metadata`
Get metadata information (Admin only).

### Technical Pipeline Endpoints

#### GET `/technical-pipeline`
Get complete technical pipeline with all modules, data flow, and performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "title": "NeuroAid Technical Pipeline",
      "totalModules": 8,
      "averageProcessingTime": "90-120 seconds",
      ...
    },
    "modules": [ ... ],
    "dataFlow": { ... },
    "performance": { ... }
  },
  "metadata": { ... }
}
```

#### GET `/technical-pipeline/modules`
Get all 8 pipeline modules.

#### GET `/technical-pipeline/modules/:id`
Get specific module by ID (e.g., `ml-inference`, `data-collection`).

#### GET `/technical-pipeline/modules/category/:category`
Get modules by category (Input, Processing, Analysis, Prediction, Output, Infrastructure).

#### GET `/technical-pipeline/categories`
Get list of all categories with module counts.

#### GET `/technical-pipeline/data-flow`
Get information about data flow through the pipeline.

#### GET `/technical-pipeline/performance`
Get overall pipeline performance metrics.

#### PUT `/technical-pipeline/modules/:id`
Update specific module (Admin only).

#### POST `/technical-pipeline/modules`
Add new module (Admin only).

#### DELETE `/technical-pipeline/modules/:id`
Delete specific module (Admin only).

**📚 Full Technical Pipeline API Documentation**: See `TECHNICAL_PIPELINE_API.md` and `TECHNICAL_PIPELINE_README.md`

### Speech-to-Text Endpoints

#### POST `/speech-to-text/transcribe`
Upload and transcribe audio files using Whisper AI.

**Request (Multipart Form):**
```bash
curl -X POST http://localhost:5000/api/speech-to-text/transcribe \
  -F "audio=@recording.wav" \
  -F "language=en" \
  -F "model=base" \
  -F "enhanceAudio=true"
```

**Response:**
```json
{
  "success": true,
  "message": "Transcription completed successfully",
  "data": {
    "transcriptionId": "uuid-string",
    "text": "Transcribed text content...",
    "language": "en",
    "confidence": 0.95,
    "duration": 45.2,
    "processingTime": 3.8,
    "wordCount": 87
  },
  "metadata": {
    "fileInfo": {
      "originalName": "recording.wav",
      "size": 1024000,
      "formattedSize": "1.02 MB"
    }
  }
}
```

#### GET `/speech-to-text/transcriptions`
Get paginated list of transcriptions.

#### GET `/speech-to-text/transcriptions/:id`
Get specific transcription by ID.

#### GET `/speech-to-text/transcriptions/:id/export`
Export transcription in various formats (TXT, JSON, SRT, VTT).

#### GET `/speech-to-text/stats`
Get transcription usage statistics.

#### GET `/speech-to-text/health`
Check Whisper service health status.

#### GET `/speech-to-text/formats`
Get supported audio formats and upload limits.

**📚 Full Speech-to-Text API Documentation**: See `SPEECH_TO_TEXT_API.md`

### Feature Extraction Endpoints

#### POST `/feature-extraction/analyze`
Extract comprehensive NLP features from text for cognitive health analysis.

**Request (JSON):**
```bash
curl -X POST http://localhost:5000/api/feature-extraction/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text to analyze here...",
    "options": {
      "includeAdvanced": true,
      "includeCognitive": true,
      "analysisType": "comprehensive"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Feature extraction completed successfully",
  "data": {
    "analysisId": "uuid-string",
    "features": {
      "basic": {
        "wordCount": 25,
        "sentenceCount": 3,
        "typeTokenRatio": 0.84
      },
      "lexical": {
        "vocabularySize": 21,
        "lexicalDiversity": 0.84,
        "complexWordRatio": 0.12
      },
      "sentiment": {
        "sentimentScore": 2,
        "sentimentPolarity": "positive"
      },
      "cognitive": {
        "cognitiveHealthScore": 0.78,
        "syntacticComplexity": 0.42,
        "informationDensity": 0.64
      }
    },
    "processingTime": 1.23
  },
  "summary": {
    "readabilityLevel": "standard",
    "sentimentPolarity": "positive",
    "cognitiveHealthScore": 0.78
  },
  "cognitiveInsights": {
    "overallAssessment": "good",
    "strengths": ["Rich vocabulary usage"],
    "recommendations": []
  }
}
```

#### POST `/feature-extraction/analyze-transcription/:transcriptionId`
Extract features from existing speech transcription with timing data.

#### GET `/feature-extraction/analyses`
Get paginated list of feature analyses.

#### GET `/feature-extraction/analyses/:id`
Get specific analysis by ID.

#### POST `/feature-extraction/compare`
Compare multiple analyses for trends and cognitive patterns.

#### GET `/feature-extraction/stats`
Get feature extraction usage statistics and cognitive health metrics.

#### GET `/feature-extraction/health`
Check NLP service health and spaCy/NLTK availability.

#### GET `/feature-extraction/capabilities`
Get available features and analysis capabilities.

**📚 Full Feature Extraction API Documentation**: See `FEATURE_EXTRACTION_API.md`

### Cognitive Model Endpoints

#### POST `/cognitive-model/score`
Score cognitive features using trained ML models for risk assessment.

**Request (JSON):**
```bash
curl -X POST http://localhost:5000/api/cognitive-model/score \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "basic": {
        "wordCount": 150,
        "sentenceCount": 12,
        "typeTokenRatio": 0.75
      },
      "lexical": {
        "vocabularySize": 120,
        "lexicalDiversity": 0.8,
        "complexWordRatio": 0.15
      },
      "cognitive": {
        "cognitiveHealthScore": 0.82,
        "syntacticComplexity": 0.65,
        "informationDensity": 0.71,
        "hesitationRatio": 0.03
      }
    },
    "options": {
      "includeFeatureImportance": true,
      "includeClinicalInterpretation": true
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Cognitive features scored successfully",
  "data": {
    "scoringId": "uuid-string",
    "riskScore": 0.78,
    "confidence": 0.89,
    "riskCategory": {
      "level": "low",
      "label": "Low Risk",
      "description": "Cognitive indicators within normal ranges",
      "color": "green"
    },
    "modelMetadata": {
      "modelName": "Cognitive Health Ensemble Classifier",
      "modelVersion": "1.0.0",
      "modelType": "ensemble",
      "performanceMetrics": {
        "accuracy": 0.892,
        "precision": 0.885,
        "recall": 0.901,
        "f1Score": 0.893
      }
    },
    "featureImportance": {
      "cognitiveHealthScore": 0.25,
      "syntacticComplexity": 0.18,
      "lexicalDiversity": 0.15,
      "informationDensity": 0.12
    },
    "clinicalInterpretation": {
      "summary": "Cognitive health indicators are within expected ranges (78% score).",
      "clinicalSignificance": "Results suggest maintained cognitive function.",
      "limitations": [
        "This assessment is not a diagnostic tool",
        "Results may be influenced by education and language background"
      ]
    },
    "recommendations": {
      "immediate": ["Continue current cognitive health practices"],
      "shortTerm": ["Schedule routine follow-up in 6-12 months"],
      "lifestyle": ["Maintain regular physical exercise", "Engage in cognitively stimulating activities"]
    },
    "qualityMetrics": {
      "featureCompleteness": 0.95,
      "dataQuality": {
        "score": 0.92,
        "recommendation": "Data quality is sufficient for analysis"
      },
      "modelReliability": {
        "reliability": "high",
        "confidence": 0.89
      }
    }
  }
}
```

#### POST `/cognitive-model/score-analysis/:analysisId`
Score features from existing feature extraction analysis.

#### POST `/cognitive-model/batch-score`
Score multiple feature sets in batch (max 10 per request).

#### POST `/cognitive-model/compare-scores`
Compare multiple scoring results for trend analysis.

#### GET `/cognitive-model/health`
Check ML model service health and availability.

#### GET `/cognitive-model/capabilities`
Get model capabilities, supported features, and performance metrics.

#### GET `/cognitive-model/stats`
Get cognitive model scoring statistics and usage metrics.

**📚 Full Cognitive Model API Documentation**: See `COGNITIVE_MODEL_API.md`

### Explainability Endpoints

#### POST `/explainability/explain`
Generate SHAP explanations for cognitive model predictions with visualizations.

**Request (JSON):**
```bash
curl -X POST http://localhost:5000/api/explainability/explain \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "basic": {
        "wordCount": 150,
        "sentenceCount": 12,
        "typeTokenRatio": 0.75
      },
      "lexical": {
        "vocabularySize": 120,
        "lexicalDiversity": 0.8,
        "complexWordRatio": 0.15
      },
      "cognitive": {
        "cognitiveHealthScore": 0.82,
        "syntacticComplexity": 0.65,
        "informationDensity": 0.71,
        "hesitationRatio": 0.03
      }
    },
    "prediction": {
      "scoringId": "uuid-string",
      "riskScore": 0.78,
      "confidence": 0.89
    },
    "options": {
      "types": ["waterfall", "bar", "force"],
      "includeVisualizations": true
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "SHAP explanation generated successfully",
  "data": {
    "explanationId": "uuid-string",
    "shapValues": {
      "cognitiveHealthScore": 0.156,
      "lexicalDiversity": 0.089,
      "syntacticComplexity": 0.067,
      "hesitationRatio": -0.023
    },
    "baseValue": 0.5,
    "featureAttributions": {
      "cognitiveHealthScore": {
        "shapValue": 0.156,
        "direction": "positive",
        "percentageContribution": 32.4,
        "interpretation": "This feature significantly increased the cognitive health score"
      }
    },
    "visualizations": {
      "waterfall": {
        "type": "waterfall",
        "name": "Waterfall Plot",
        "filename": "waterfall_20241025_123456_7890.png",
        "url": "/api/explainability/visualization/waterfall_20241025_123456_7890.png",
        "status": "ready"
      }
    },
    "insights": {
      "topPositiveFeatures": [
        {
          "feature": "cognitiveHealthScore",
          "shapValue": 0.156,
          "contribution": 32.4,
          "interpretation": "Strong positive impact on prediction"
        }
      ],
      "keyFindings": [
        {
          "type": "primary_driver",
          "message": "cognitiveHealthScore was the most influential factor",
          "importance": "high"
        }
      ],
      "clinicalRelevance": [
        {
          "domain": "cognitive_function",
          "message": "Cognitive health score supported the overall assessment",
          "clinicalSignificance": "high",
          "recommendation": "Cognitive function appears preserved"
        }
      ]
    },
    "interpretability": {
      "globalImportance": {
        "cognitiveHealthScore": {
          "meanAbsoluteShap": 0.156,
          "percentageContribution": 32.4,
          "rank": 1
        }
      },
      "localExplanation": {
        "summary": "This prediction was primarily influenced by cognitiveHealthScore, lexicalDiversity, syntacticComplexity",
        "featureValues": {
          "cognitiveHealthScore": {
            "value": 0.82,
            "shapValue": 0.156,
            "impact": "positive"
          }
        }
      }
    }
  }
}
```

#### POST `/explainability/score-and-explain`
Score features and generate explanation in a single integrated request.

#### POST `/explainability/explain-score/:scoringId`
Generate explanation for existing cognitive model scoring result.

#### POST `/explainability/compare`
Compare SHAP explanations across multiple predictions for trend analysis.

#### GET `/explainability/explanation/:explanationId`
Retrieve previously generated explanation by ID.

#### GET `/explainability/visualization/:filename`
Serve SHAP visualization files (PNG, SVG, HTML formats).

#### GET `/explainability/health`
Check SHAP service health and Python environment status.

#### GET `/explainability/capabilities`
Get explainability service capabilities and supported visualization types.

#### GET `/explainability/stats`
Get explainability usage statistics and feature importance analytics.

**📚 Full Explainability API Documentation**: See `EXPLAINABILITY_API.md`

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based endpoint protection
- Secure password hashing with bcrypt

### Rate Limiting
- Global rate limiting: 100 requests per 15 minutes
- Auth rate limiting: 5 login attempts per 15 minutes
- Configurable limits per endpoint

### Security Middleware
- **Helmet**: Sets various HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation
- **Error Handling**: Sanitized error responses

## 📊 Data Structure

### Step Schema
```javascript
{
  id: Number (required, unique),
  icon: String (required),
  title: String (required, 1-100 chars),
  shortDesc: String (required, 1-200 chars),
  duration: String (required, 1-50 chars),
  color: String (required, CSS gradient pattern),
  bgColor: String (required, CSS class pattern),
  borderColor: String (required, CSS class pattern),
  details: {
    overview: String (required, 1-1000 chars),
    substeps: Array (required, 1-10 items),
    technicalDetails: Array (required, 1-20 items)
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X GET http://localhost:5000/api/how-it-works

# Test with authentication
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your-token>"
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "metadata": { ... }
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [ ... ] // For validation errors
}
```

## 🔄 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] File upload support for images
- [ ] Content versioning and rollback
- [ ] Audit logging
- [ ] WebSocket support for real-time updates
- [ ] Content scheduling
- [ ] Multi-language support
- [ ] Advanced caching with Redis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@neuroaid.com

---

**NeuroAid Backend API** - Empowering dynamic content management for cognitive health applications.
