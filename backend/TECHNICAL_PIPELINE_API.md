# Technical Pipeline API Documentation

## Overview
The Technical Pipeline API provides detailed information about NeuroAid's AI-powered cognitive assessment pipeline, including module metadata, data flow, and performance metrics. This API is designed to power frontend visualizations and provide transparency about the technical implementation.

---

## Base URL
```
http://localhost:5000/api/technical-pipeline
```

Production:
```
https://api.neuroaid.com/api/technical-pipeline
```

---

## Authentication
- **Public Endpoints**: Most GET endpoints are publicly accessible
- **Protected Endpoints**: PUT, POST, DELETE require admin authentication
- **Headers**: 
  ```
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```

---

## Endpoints

### 1. Get Complete Technical Pipeline

**GET** `/api/technical-pipeline`

Returns the complete technical pipeline including overview, all modules, data flow, and performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "title": "NeuroAid Technical Pipeline",
      "description": "End-to-end AI-powered cognitive assessment pipeline",
      "totalModules": 8,
      "averageProcessingTime": "90-120 seconds",
      "architecture": "Microservices-based with RESTful APIs",
      "scalability": "Horizontally scalable, supports 10,000+ concurrent assessments"
    },
    "modules": [...],
    "dataFlow": {...},
    "performance": {...}
  },
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-10-24T16:30:00Z",
    "updatedBy": "system"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Get Pipeline Overview

**GET** `/api/technical-pipeline/overview`

Returns high-level overview of the pipeline.

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "NeuroAid Technical Pipeline",
    "description": "End-to-end AI-powered cognitive assessment pipeline",
    "totalModules": 8,
    "averageProcessingTime": "90-120 seconds",
    "architecture": "Microservices-based with RESTful APIs",
    "scalability": "Horizontally scalable, supports 10,000+ concurrent assessments"
  }
}
```

---

### 3. Get All Modules

**GET** `/api/technical-pipeline/modules`

Returns all pipeline modules with their metadata.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "data-collection",
      "name": "Data Collection Module",
      "category": "Input",
      "order": 1,
      "description": "Captures user speech and text input",
      "icon": "Database",
      "color": "from-blue-500 to-blue-600",
      "bgColor": "bg-blue-50",
      "borderColor": "border-blue-200",
      "processingTime": "5-10 seconds",
      "technologies": [...],
      "inputs": [...],
      "outputs": [...],
      "security": [...],
      "performance": {...}
    },
    ...
  ],
  "count": 8,
  "metadata": {...}
}
```

---

### 4. Get Specific Module

**GET** `/api/technical-pipeline/modules/:id`

Returns details for a specific module.

**Parameters:**
- `id` (string) - Module ID (e.g., "data-collection", "ml-inference")

**Example:**
```
GET /api/technical-pipeline/modules/ml-inference
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ml-inference",
    "name": "Machine Learning Inference",
    "category": "Prediction",
    "order": 6,
    "description": "Applies ensemble of ML models to predict cognitive risk scores",
    "icon": "Cpu",
    "color": "from-green-500 to-green-600",
    "bgColor": "bg-green-50",
    "borderColor": "border-green-200",
    "processingTime": "10-15 seconds",
    "technologies": [
      "TensorFlow 2.x",
      "PyTorch",
      "XGBoost",
      "LightGBM"
    ],
    "models": [
      {
        "name": "Deep Neural Network",
        "architecture": "5-layer feedforward",
        "parameters": "2.5M",
        "accuracy": "87% sensitivity, 92% specificity",
        "weight": "40%"
      },
      ...
    ],
    "performance": {
      "throughput": "1000 predictions/second",
      "latency": "< 50ms per prediction"
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Module not found

---

### 5. Get Modules by Category

**GET** `/api/technical-pipeline/modules/category/:category`

Returns all modules in a specific category.

**Parameters:**
- `category` (string) - One of: Input, Processing, Analysis, Prediction, Output, Infrastructure

**Example:**
```
GET /api/technical-pipeline/modules/category/Processing
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "audio-preprocessing",
      "name": "Audio Preprocessing",
      "category": "Processing",
      ...
    },
    {
      "id": "speech-to-text",
      "name": "Speech-to-Text Transcription",
      "category": "Processing",
      ...
    }
  ],
  "count": 2,
  "category": "Processing"
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - No modules found in category

---

### 6. Get All Categories

**GET** `/api/technical-pipeline/categories`

Returns list of all module categories with counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Input",
      "count": 1,
      "modules": [
        { "id": "data-collection", "name": "Data Collection Module" }
      ]
    },
    {
      "category": "Processing",
      "count": 2,
      "modules": [
        { "id": "audio-preprocessing", "name": "Audio Preprocessing" },
        { "id": "speech-to-text", "name": "Speech-to-Text Transcription" }
      ]
    },
    ...
  ],
  "totalCategories": 6
}
```

---

### 7. Get Data Flow

**GET** `/api/technical-pipeline/data-flow`

Returns information about how data flows through the pipeline.

**Response:**
```json
{
  "success": true,
  "data": {
    "description": "Sequential data flow through the pipeline",
    "stages": [
      {
        "stage": 1,
        "modules": ["data-collection"],
        "parallel": false,
        "description": "User provides speech and text input"
      },
      {
        "stage": 2,
        "modules": ["audio-preprocessing", "speech-to-text"],
        "parallel": true,
        "description": "Audio is preprocessed while being transcribed"
      },
      ...
    ],
    "totalStages": 6,
    "parallelizationPoints": 2,
    "bottlenecks": [...]
  }
}
```

---

### 8. Get Performance Metrics

**GET** `/api/technical-pipeline/performance`

Returns overall pipeline performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "averageProcessingTime": "90-120 seconds",
      "p95ProcessingTime": "150 seconds",
      "p99ProcessingTime": "180 seconds",
      "throughput": "500 concurrent assessments",
      "successRate": "99.7%"
    },
    "infrastructure": {
      "architecture": "Microservices on Kubernetes",
      "cloudProvider": "AWS",
      "regions": ["us-east-1", "eu-west-1", "ap-southeast-1"],
      "autoscaling": "CPU-based (target 70% utilization)"
    },
    "monitoring": {...},
    "optimization": {...}
  }
}
```

---

## Protected Endpoints (Admin Only)

### 9. Update Entire Pipeline

**PUT** `/api/technical-pipeline`

Updates the complete technical pipeline data.

**Authentication:** Required (Admin with `manage_content` permission)

**Request Body:**
```json
{
  "overview": {...},
  "modules": [...],
  "dataFlow": {...},
  "performance": {...}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Technical pipeline updated successfully",
  "data": {...},
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-10-24T17:00:00Z",
    "updatedBy": "admin_username"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions

---

### 10. Update Specific Module

**PUT** `/api/technical-pipeline/modules/:id`

Updates a specific module.

**Authentication:** Required (Admin with `manage_content` permission)

**Parameters:**
- `id` (string) - Module ID

**Request Body:**
```json
{
  "id": "ml-inference",
  "name": "Machine Learning Inference",
  "category": "Prediction",
  "order": 6,
  "description": "Updated description",
  "icon": "Cpu",
  "color": "from-green-500 to-green-600",
  "bgColor": "bg-green-50",
  "borderColor": "border-green-200",
  "processingTime": "10-15 seconds",
  "technologies": [...],
  "inputs": [...],
  "outputs": [...],
  "performance": {...}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module ml-inference updated successfully",
  "data": {...},
  "metadata": {...}
}
```

---

### 11. Add New Module

**POST** `/api/technical-pipeline/modules`

Adds a new module to the pipeline.

**Authentication:** Required (Admin with `manage_content` permission)

**Request Body:**
```json
{
  "id": "new-module",
  "name": "New Module Name",
  "category": "Processing",
  "order": 9,
  "description": "Module description",
  "icon": "IconName",
  "color": "from-blue-500 to-blue-600",
  "bgColor": "bg-blue-50",
  "borderColor": "border-blue-200",
  "processingTime": "5 seconds",
  "technologies": ["Tech1", "Tech2"],
  "inputs": [],
  "outputs": [],
  "performance": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "New module added successfully",
  "data": {...},
  "metadata": {...}
}
```

**Status Codes:**
- `201 Created` - Success
- `400 Bad Request` - Module ID already exists or validation error

---

### 12. Delete Module

**DELETE** `/api/technical-pipeline/modules/:id`

Deletes a specific module.

**Authentication:** Required (Admin with `manage_content` permission)

**Parameters:**
- `id` (string) - Module ID

**Response:**
```json
{
  "success": true,
  "message": "Module ml-inference deleted successfully",
  "deletedModule": {...},
  "metadata": {...}
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Module not found

---

### 13. Get Metadata

**GET** `/api/technical-pipeline/metadata`

Returns metadata about the pipeline data (version, last updated, etc.).

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "lastUpdated": "2025-10-24T16:30:00Z",
    "updatedBy": "system",
    "dataSource": "NeuroAid Technical Team",
    "apiVersion": "v1",
    "documentation": "https://docs.neuroaid.com/technical-pipeline",
    "changelog": [...]
  }
}
```

---

## Data Models

### Module Object
```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Display name
  category: string;              // Input|Processing|Analysis|Prediction|Output|Infrastructure
  order: number;                 // Display order
  description: string;           // Brief description
  icon: string;                  // Lucide icon name
  color: string;                 // Tailwind gradient class
  bgColor: string;               // Tailwind background class
  borderColor: string;           // Tailwind border class
  processingTime: string;        // Human-readable time
  technologies: string[];        // List of technologies used
  inputs: object[];              // Input specifications
  outputs: object[];             // Output specifications
  performance?: object;          // Performance metrics
  [key: string]: any;            // Additional fields
}
```

### Overview Object
```typescript
{
  title: string;
  description: string;
  totalModules: number;
  averageProcessingTime: string;
  architecture: string;
  scalability: string;
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "category",
      "message": "must be one of [Input, Processing, Analysis, Prediction, Output, Infrastructure]"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Module not found",
  "message": "Module with ID xyz does not exist"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "No token provided or invalid token"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Response Header**: `X-RateLimit-Remaining`

When rate limit is exceeded:
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 900
}
```

---

## CORS

- **Allowed Origins**: Configured via `FRONTEND_URL` environment variable
- **Default**: `http://localhost:3000`
- **Credentials**: Enabled

---

## Usage Examples

### JavaScript/Fetch
```javascript
// Get all modules
fetch('http://localhost:5000/api/technical-pipeline/modules')
  .then(res => res.json())
  .then(data => console.log(data.data));

// Get specific module
fetch('http://localhost:5000/api/technical-pipeline/modules/ml-inference')
  .then(res => res.json())
  .then(data => console.log(data.data));

// Update module (requires authentication)
fetch('http://localhost:5000/api/technical-pipeline/modules/ml-inference', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    // module data
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

function useTechnicalPipeline() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/technical-pipeline')
      .then(res => res.json())
      .then(result => {
        setData(result.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

// Usage
function TechnicalPipelineComponent() {
  const { data, loading, error } = useTechnicalPipeline();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{data.overview.title}</h1>
      {data.modules.map(module => (
        <div key={module.id}>{module.name}</div>
      ))}
    </div>
  );
}
```

### Axios Example
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get all modules
const getModules = async () => {
  try {
    const response = await api.get('/technical-pipeline/modules');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

// Get modules by category
const getModulesByCategory = async (category) => {
  try {
    const response = await api.get(`/technical-pipeline/modules/category/${category}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching modules by category:', error);
    throw error;
  }
};
```

---

## Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Get All Modules
```bash
curl http://localhost:5000/api/technical-pipeline/modules
```

### Get Specific Module
```bash
curl http://localhost:5000/api/technical-pipeline/modules/ml-inference
```

### Get Categories
```bash
curl http://localhost:5000/api/technical-pipeline/categories
```

---

## Best Practices

1. **Caching**: Cache responses on the frontend for 5-10 minutes
2. **Error Handling**: Always handle errors gracefully
3. **Loading States**: Show loading indicators while fetching
4. **Retry Logic**: Implement exponential backoff for failed requests
5. **Pagination**: For large datasets, consider implementing pagination
6. **Compression**: Enable gzip compression for responses

---

## Changelog

### Version 1.0.0 (2025-10-24)
- Initial release
- 8 pipeline modules
- Complete CRUD operations
- Category filtering
- Performance metrics
- Data flow visualization

---

## Support

- **Documentation**: https://docs.neuroaid.com/technical-pipeline
- **API Status**: https://status.neuroaid.com
- **Contact**: api-support@neuroaid.com
- **GitHub**: https://github.com/neuroaid/backend

---

**Last Updated**: October 24, 2025  
**API Version**: 1.0.0  
**Maintained By**: NeuroAid Backend Team
