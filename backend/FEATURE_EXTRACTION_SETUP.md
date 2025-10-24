# Feature Extraction Setup Guide

Complete setup guide for NeuroAid's Feature Extraction API with spaCy and NLTK integration.

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js** v16+ 
- **Python** 3.8+
- **pip** (Python package manager)
- **Git** (for cloning)

### 2. Installation

#### Step 1: Install Node.js Dependencies
```bash
cd backend
npm install
```

#### Step 2: Install Python Dependencies
```bash
# Install Python packages
pip install -r requirements.txt

# Verify installation
python -c "import spacy, nltk, textstat; print('All packages installed successfully')"
```

#### Step 3: Download Required Models
```bash
# Download NLTK data
python -c "
import nltk
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('stopwords')
nltk.download('vader_lexicon')
nltk.download('maxent_ne_chunker')
nltk.download('words')
print('NLTK data downloaded successfully')
"

# Download spaCy model
python -m spacy download en_core_web_sm
python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('spaCy model loaded successfully')"
```

#### Step 4: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
```

Required environment variables:
```env
# Feature Extraction Configuration
PYTHON_PATH=python3
SPACY_MODEL=en_core_web_sm
FEATURES_DIR=./data/features
ENABLE_ADVANCED_NLP=true
COGNITIVE_ANALYSIS_ENABLED=true
```

#### Step 5: Test Installation
```bash
# Start the server
npm run dev

# Test the API
curl -X GET http://localhost:5000/api/feature-extraction/health
```

## 🔧 Detailed Configuration

### Python Environment Setup

#### Option 1: System Python
```bash
# Install globally
pip install -r requirements.txt
```

#### Option 2: Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv nlp_env

# Activate virtual environment
# On Windows:
nlp_env\Scripts\activate
# On macOS/Linux:
source nlp_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Update .env with virtual environment path
echo "PYTHON_PATH=$(which python)" >> .env
```

#### Option 3: Conda Environment
```bash
# Create conda environment
conda create -n neuroaid-nlp python=3.9
conda activate neuroaid-nlp

# Install dependencies
pip install -r requirements.txt

# Update .env
echo "PYTHON_PATH=$(which python)" >> .env
```

### Advanced spaCy Configuration

#### Install Additional Models
```bash
# For better accuracy (larger model)
python -m spacy download en_core_web_md

# For maximum accuracy (largest model)
python -m spacy download en_core_web_lg

# Update .env to use larger model
echo "SPACY_MODEL=en_core_web_md" >> .env
```

#### Custom Model Training (Optional)
```bash
# If you have domain-specific data
python -m spacy train config.cfg --output ./models --paths.train ./train.spacy --paths.dev ./dev.spacy
```

### NLTK Data Management

#### Manual Download
```python
import nltk
nltk.download_shell()  # Interactive download interface
```

#### Verify NLTK Data
```python
import nltk
print("NLTK data path:", nltk.data.path)
print("Available corpora:", nltk.corpus.__all__)
```

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/feature-extraction/health
```

Expected response:
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
    "advancedNLP": "available"
  }
}
```

### 2. Capabilities Check
```bash
curl -X GET http://localhost:5000/api/feature-extraction/capabilities
```

### 3. Basic Analysis Test
```bash
curl -X POST http://localhost:5000/api/feature-extraction/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a test sentence for feature extraction. It should work correctly if everything is set up properly.",
    "options": {
      "includeAdvanced": true,
      "includeCognitive": true
    }
  }'
```

### 4. Python Script Test
```python
# test_nlp.py
import sys
import json
sys.path.append('./scripts')

from nlp_analyzer import NLPFeatureExtractor

# Test the analyzer
extractor = NLPFeatureExtractor()
test_text = "This is a comprehensive test of the NLP feature extraction system."

features = extractor.extract_features(test_text)
print(json.dumps(features, indent=2))
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Python Not Found
```bash
# Error: Python command not found
# Solution: Update PYTHON_PATH in .env
which python3
echo "PYTHON_PATH=/usr/bin/python3" >> .env
```

#### 2. spaCy Model Not Found
```bash
# Error: Can't find model 'en_core_web_sm'
# Solution: Download the model
python -m spacy download en_core_web_sm

# Verify installation
python -c "import spacy; spacy.load('en_core_web_sm')"
```

#### 3. NLTK Data Missing
```bash
# Error: Resource punkt not found
# Solution: Download NLTK data
python -c "import nltk; nltk.download('punkt')"
```

#### 4. Permission Errors
```bash
# Error: Permission denied
# Solution: Use virtual environment or --user flag
pip install --user -r requirements.txt
```

#### 5. Memory Issues
```bash
# Error: Memory error with large texts
# Solution: Reduce text size or increase memory limits
echo "NODE_OPTIONS=--max-old-space-size=4096" >> .env
```

### Performance Optimization

#### 1. Model Selection
```bash
# For speed (small model)
echo "SPACY_MODEL=en_core_web_sm" >> .env

# For accuracy (large model)
echo "SPACY_MODEL=en_core_web_lg" >> .env
```

#### 2. Disable Advanced Features (if needed)
```bash
echo "ENABLE_ADVANCED_NLP=false" >> .env
echo "COGNITIVE_ANALYSIS_ENABLED=false" >> .env
```

#### 3. Caching Configuration
```bash
# Enable result caching
mkdir -p ./data/features/cache
echo "ENABLE_FEATURE_CACHE=true" >> .env
```

### Debugging

#### 1. Enable Debug Logging
```bash
echo "DEBUG=feature-extraction:*" >> .env
echo "NODE_ENV=development" >> .env
```

#### 2. Python Debug Mode
```python
# Add to nlp_analyzer.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### 3. Test Individual Components
```bash
# Test basic features only
curl -X POST http://localhost:5000/api/feature-extraction/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Simple test.",
    "options": {
      "analysisType": "basic"
    }
  }'
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Production environment variables
echo "NODE_ENV=production" >> .env
echo "ENABLE_ADVANCED_NLP=true" >> .env
echo "COGNITIVE_ANALYSIS_ENABLED=true" >> .env
```

### 2. Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name neuroaid-api

# Using Docker
docker build -t neuroaid-api .
docker run -p 5000:5000 neuroaid-api
```

### 3. Performance Monitoring
```bash
# Monitor Python processes
ps aux | grep python

# Monitor memory usage
free -h

# Monitor API performance
curl -X GET http://localhost:5000/api/feature-extraction/stats
```

## 📊 Feature Categories

### Available Features

1. **Basic Features** ✅
   - Word/sentence/character counts
   - Average lengths and ratios
   - Type-token ratio

2. **Lexical Features** ✅
   - Vocabulary diversity
   - Word frequency analysis
   - Complex word detection

3. **Sentiment Analysis** ✅
   - Polarity scoring
   - Emotional indicators
   - Positive/negative word counts

4. **Readability Metrics** ✅
   - Flesch Reading Ease
   - Automated Readability Index
   - Grade level estimation

5. **Linguistic Analysis** ✅
   - Part-of-speech tagging
   - Named entity recognition
   - Syntactic patterns

6. **Advanced NLP** (requires spaCy) ⚙️
   - Dependency parsing
   - Semantic analysis
   - Syntactic complexity

7. **Cognitive Indicators** (requires full setup) 🧠
   - Speech fluency metrics
   - Hesitation patterns
   - Information density
   - Cognitive health scoring

## 📚 API Usage Examples

### JavaScript Integration
```javascript
const analyzeText = async (text) => {
  const response = await fetch('/api/feature-extraction/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      text,
      options: { includeAdvanced: true, includeCognitive: true }
    })
  });
  return response.json();
};
```

### Python Integration
```python
import requests

def analyze_text(text):
    response = requests.post(
        'http://localhost:5000/api/feature-extraction/analyze',
        json={
            'text': text,
            'options': {
                'includeAdvanced': True,
                'includeCognitive': True
            }
        }
    )
    return response.json()
```

## 🔄 Maintenance

### Regular Updates
```bash
# Update Python packages
pip install --upgrade -r requirements.txt

# Update spaCy models
python -m spacy download en_core_web_sm --upgrade

# Update NLTK data
python -c "import nltk; nltk.download('punkt', force=True)"
```

### Cleanup
```bash
# Clean temporary files
rm -rf ./data/features/cache/*

# Clean Python cache
find . -type d -name __pycache__ -delete
```

---

**Feature Extraction Setup** - Complete guide for advanced NLP analysis in NeuroAid cognitive health platform.
