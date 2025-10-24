# Technical Pipeline API - Quick Start

## Overview
The Technical Pipeline API provides comprehensive information about NeuroAid's AI-powered cognitive assessment pipeline, designed to power frontend visualizations and provide transparency.

---

## 🚀 Quick Start

### Start the Server
```bash
cd backend
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

### Test the API
```bash
# Health check
curl http://localhost:5000/health

# Get all modules
curl http://localhost:5000/api/technical-pipeline/modules

# Get specific module
curl http://localhost:5000/api/technical-pipeline/modules/ml-inference
```

---

## 📋 Available Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/technical-pipeline` | Get complete pipeline |
| GET | `/api/technical-pipeline/overview` | Get pipeline overview |
| GET | `/api/technical-pipeline/modules` | Get all modules |
| GET | `/api/technical-pipeline/modules/:id` | Get specific module |
| GET | `/api/technical-pipeline/modules/category/:category` | Get modules by category |
| GET | `/api/technical-pipeline/categories` | Get all categories |
| GET | `/api/technical-pipeline/data-flow` | Get data flow info |
| GET | `/api/technical-pipeline/performance` | Get performance metrics |

### Protected Endpoints (Admin Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/technical-pipeline` | Update entire pipeline |
| PUT | `/api/technical-pipeline/modules/:id` | Update specific module |
| POST | `/api/technical-pipeline/modules` | Add new module |
| DELETE | `/api/technical-pipeline/modules/:id` | Delete module |
| GET | `/api/technical-pipeline/metadata` | Get metadata |

---

## 🎯 8 Pipeline Modules

1. **Data Collection** (Input) - Captures speech and text
2. **Audio Preprocessing** (Processing) - Cleans and normalizes audio
3. **Speech-to-Text** (Processing) - Converts speech to text
4. **NLP Analysis** (Analysis) - Analyzes linguistic patterns
5. **Feature Extraction** (Analysis) - Combines features
6. **ML Inference** (Prediction) - Applies AI models
7. **Result Generation** (Output) - Creates reports
8. **Data Storage** (Infrastructure) - Secure storage

---

## 📊 Module Categories

- **Input**: Data collection from users
- **Processing**: Audio and text preprocessing
- **Analysis**: Feature extraction and NLP
- **Prediction**: Machine learning inference
- **Output**: Result generation and reports
- **Infrastructure**: Storage and security

---

## 💻 Frontend Integration

### React Example
```javascript
import { useState, useEffect } from 'react';

function TechnicalPipeline() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/technical-pipeline/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {modules.map(module => (
        <div key={module.id}>
          <h3>{module.name}</h3>
          <p>{module.description}</p>
          <span>Time: {module.processingTime}</span>
        </div>
      ))}
    </div>
  );
}
```

### Fetch All Data
```javascript
const response = await fetch('http://localhost:5000/api/technical-pipeline');
const { data } = await response.json();

console.log(data.overview);    // Pipeline overview
console.log(data.modules);     // All 8 modules
console.log(data.dataFlow);    // Data flow stages
console.log(data.performance); // Performance metrics
```

### Get Specific Category
```javascript
const response = await fetch(
  'http://localhost:5000/api/technical-pipeline/modules/category/Processing'
);
const { data } = await response.json();
// Returns: Audio Preprocessing & Speech-to-Text modules
```

---

## 🔧 Module Data Structure

Each module contains:
```javascript
{
  id: "ml-inference",
  name: "Machine Learning Inference",
  category: "Prediction",
  order: 6,
  description: "Applies ensemble of ML models...",
  icon: "Cpu",
  color: "from-green-500 to-green-600",
  bgColor: "bg-green-50",
  borderColor: "border-green-200",
  processingTime: "10-15 seconds",
  technologies: ["TensorFlow", "PyTorch", "XGBoost"],
  inputs: [...],
  outputs: [...],
  performance: {...}
}
```

---

## 📈 Response Format

All responses follow this structure:
```javascript
{
  success: true,
  data: { /* actual data */ },
  metadata: {
    version: "1.0.0",
    lastUpdated: "2025-10-24T16:30:00Z",
    updatedBy: "system"
  }
}
```

Error responses:
```javascript
{
  success: false,
  error: "Error type",
  message: "Detailed error message"
}
```

---

## 🎨 Frontend Visualization Ideas

### 1. Interactive Pipeline Diagram
- Show all 8 modules in sequence
- Click to expand module details
- Animated data flow between modules

### 2. Category Tabs
- Tab for each category (Input, Processing, etc.)
- Display modules within each category
- Show processing times and technologies

### 3. Timeline View
- Horizontal timeline showing order
- Visual indicators for parallel processing
- Total time calculation

### 4. Performance Dashboard
- Overall metrics (throughput, latency)
- Per-module performance charts
- Infrastructure details

### 5. Technical Details Cards
- Expandable cards for each module
- Technologies, inputs, outputs
- Model architectures and accuracy

---

## 🔐 Security Features

- **HIPAA Compliant**: All data handling meets HIPAA standards
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Authentication**: JWT-based for protected endpoints

---

## 📝 Data File Location

Pipeline data stored in:
```
backend/data/technicalPipelineData.json
```

This file contains:
- Overview information
- All 8 module definitions
- Data flow stages
- Performance metrics
- Metadata

---

## 🧪 Testing

### Test All Endpoints
```bash
# Get complete pipeline
curl http://localhost:5000/api/technical-pipeline

# Get modules
curl http://localhost:5000/api/technical-pipeline/modules

# Get specific module
curl http://localhost:5000/api/technical-pipeline/modules/data-collection

# Get by category
curl http://localhost:5000/api/technical-pipeline/modules/category/Analysis

# Get categories
curl http://localhost:5000/api/technical-pipeline/categories

# Get data flow
curl http://localhost:5000/api/technical-pipeline/data-flow

# Get performance
curl http://localhost:5000/api/technical-pipeline/performance
```

### Test with Postman
1. Import collection from `TECHNICAL_PIPELINE_API.md`
2. Set base URL: `http://localhost:5000`
3. Run all GET requests
4. Test protected endpoints with JWT token

---

## 🚨 Common Issues

### Issue: Cannot connect to API
**Solution**: Ensure server is running on port 5000
```bash
npm run dev
```

### Issue: CORS error
**Solution**: Check `FRONTEND_URL` in `.env` file
```
FRONTEND_URL=http://localhost:3000
```

### Issue: Module not found
**Solution**: Check module ID matches exactly (case-sensitive)
```javascript
// Correct
/api/technical-pipeline/modules/ml-inference

// Incorrect
/api/technical-pipeline/modules/ML-Inference
```

---

## 📦 Dependencies

Required packages (already in package.json):
- `express` - Web framework
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - Logging
- `joi` - Validation
- `dotenv` - Environment variables

---

## 🔄 Update Data

To update pipeline data:

1. **Edit JSON file directly**:
   ```bash
   nano backend/data/technicalPipelineData.json
   ```

2. **Use API (requires admin auth)**:
   ```javascript
   fetch('http://localhost:5000/api/technical-pipeline/modules/ml-inference', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer YOUR_TOKEN'
     },
     body: JSON.stringify({
       // updated module data
     })
   });
   ```

---

## 📚 Full Documentation

For complete API documentation, see:
- **API Reference**: `TECHNICAL_PIPELINE_API.md`
- **Main Backend README**: `README.md`

---

## 🎯 Next Steps

1. **Frontend Component**: Create TechnicalPipeline.tsx component
2. **Visualization**: Build interactive pipeline diagram
3. **Caching**: Implement frontend caching for better performance
4. **Real-time Updates**: Add WebSocket for live metrics
5. **Analytics**: Track which modules users explore most

---

## 💡 Tips

- **Cache responses**: Pipeline data doesn't change often
- **Show loading states**: API calls take 50-200ms
- **Error handling**: Always handle network errors
- **Progressive enhancement**: Load overview first, details on demand
- **Accessibility**: Ensure keyboard navigation works

---

## 📞 Support

- **Issues**: Check console for errors
- **Questions**: See full API documentation
- **Updates**: Check metadata.lastUpdated field

---

**Quick Links**:
- Health Check: http://localhost:5000/health
- All Modules: http://localhost:5000/api/technical-pipeline/modules
- Categories: http://localhost:5000/api/technical-pipeline/categories

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: October 2025
