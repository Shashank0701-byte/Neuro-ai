# Speech-to-Text API Documentation

A comprehensive REST API for audio file upload, processing, and transcription using Whisper AI.

## 🚀 Features

- **Audio File Upload**: Support for multiple audio formats with validation
- **Whisper Integration**: Local and remote Whisper API support
- **Real-time Processing**: Audio preprocessing and enhancement
- **Transcription Storage**: Persistent storage with metadata
- **Export Capabilities**: Multiple export formats (TXT, JSON, SRT, VTT)
- **Statistics & Analytics**: Usage statistics and performance metrics
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Comprehensive error responses

## 📋 Base URL

```
http://localhost:5000/api/speech-to-text
```

## 🔧 Environment Configuration

Add these variables to your `.env` file:

```env
# Speech-to-Text Configuration
WHISPER_API_URL=http://localhost:8000
WHISPER_API_KEY=your-whisper-api-key
WHISPER_MODEL=base
UPLOAD_MAX_SIZE=52428800
UPLOAD_DIR=./uploads
TRANSCRIPTIONS_DIR=./data/transcriptions
```

## 📚 API Endpoints

### 1. Transcribe Audio

**POST** `/transcribe`

Upload an audio file and get AI transcription.

#### Request

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `audio` (file, required): Audio file to transcribe
- `language` (string, optional): Language code (e.g., 'en', 'es', 'fr')
- `model` (string, optional): Whisper model ('tiny', 'base', 'small', 'medium', 'large')
- `enhanceAudio` (boolean, optional): Apply audio enhancement
- `responseFormat` (string, optional): Response format ('json', 'text', 'srt', 'vtt')
- `temperature` (number, optional): Randomness (0-1)

#### Response

**Success (200):**
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
    "wordCount": 87,
    "segments": [
      {
        "id": 0,
        "start": 0.0,
        "end": 3.5,
        "text": "Hello, this is a test.",
        "avg_logprob": -0.2
      }
    ],
    "words": [
      {
        "word": "Hello",
        "start": 0.0,
        "end": 0.5,
        "confidence": 0.98
      }
    ]
  },
  "metadata": {
    "fileInfo": {
      "originalName": "recording.wav",
      "size": 1024000,
      "formattedSize": "1.02 MB",
      "mimetype": "audio/wav"
    },
    "options": {
      "language": "en",
      "model": "base",
      "enhanceAudio": true
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Upload failed",
  "message": "File too large. Maximum size is 50 MB"
}
```

#### Rate Limiting
- **Limit**: 10 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

### 2. Get Transcription

**GET** `/transcriptions/:id`

Retrieve a specific transcription by ID.

#### Parameters
- `id` (string, required): Transcription UUID

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "fileInfo": {
      "name": "recording.wav",
      "size": 1024000
    },
    "result": {
      "text": "Transcribed content...",
      "language": "en",
      "duration": 45.2,
      "confidence": 0.95
    },
    "processingTime": 3.8,
    "status": "completed"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Transcription not found",
  "message": "No transcription found with ID: uuid-string"
}
```

---

### 3. List Transcriptions

**GET** `/transcriptions`

Get paginated list of transcriptions with filtering.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (1-100, default: 10)
- `status` (string, optional): Filter by status ('completed', 'failed')
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
      "result": {
        "text": "First transcription...",
        "language": "en"
      }
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

### 4. Delete Transcription

**DELETE** `/transcriptions/:id`

Delete a transcription (Admin only).

#### Headers
```
Authorization: Bearer <jwt-token>
```

#### Parameters
- `id` (string, required): Transcription UUID

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Transcription deleted successfully",
  "transcriptionId": "uuid-string"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Access token required"
}
```

---

### 5. Export Transcription

**GET** `/transcriptions/:id/export`

Export transcription in various formats.

#### Parameters
- `id` (string, required): Transcription UUID

#### Query Parameters
- `format` (string, optional): Export format ('txt', 'json', 'srt', 'vtt', default: 'txt')

#### Response

**Success (200):**
- **Content-Type**: Varies by format
- **Content-Disposition**: `attachment; filename="transcription-{id}.{format}"`
- **Body**: File content in requested format

**TXT Format:**
```
Transcription Report
==================

ID: uuid-string
Date: 1/1/2024, 12:00:00 PM
File: recording.wav
Language: en
Confidence: 95.0%
Duration: 45.20s
Processing Time: 3.80s

Transcription:
--------------
Hello, this is the transcribed content...
```

**SRT Format:**
```
1
00:00:00.000 --> 00:00:03.500
Hello, this is a test.

2
00:00:03.500 --> 00:00:07.000
This is the second segment.
```

---

### 6. Get Statistics

**GET** `/stats`

Get transcription usage statistics.

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
    "averageProcessingTime": 4.2,
    "averageConfidence": 0.94,
    "totalDuration": 3600.5,
    "languageDistribution": {
      "en": 120,
      "es": 20,
      "fr": 10
    },
    "dateRange": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    }
  }
}
```

---

### 7. Health Check

**GET** `/health`

Check service health and Whisper API connectivity.

#### Response

**Healthy (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "whisperApi": "connected",
    "model": "base",
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
    "whisperApi": "disconnected",
    "error": "Connection timeout",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 8. Supported Formats

**GET** `/formats`

Get supported audio formats and upload limits.

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "supported": [
      {
        "extension": ".mp3",
        "mimetype": "audio/mpeg",
        "description": "MP3 Audio"
      },
      {
        "extension": ".wav",
        "mimetype": "audio/wav",
        "description": "WAV Audio"
      }
    ],
    "maxFileSize": 52428800,
    "maxFileSizeFormatted": "50 MB"
  }
}
```

## 🔒 Security Features

### Rate Limiting
- **Transcription**: 10 requests per 15 minutes
- **General**: 100 requests per 15 minutes
- **Headers**: Rate limit information in response headers

### File Validation
- **Size Limit**: 50MB (configurable)
- **Format Check**: MIME type and extension validation
- **Security**: Malicious file detection

### Authentication
- **Admin Routes**: JWT token required for deletion
- **Public Routes**: Open access with rate limiting

## 🎯 Supported Audio Formats

| Format | Extension | MIME Type | Description |
|--------|-----------|-----------|-------------|
| MP3 | `.mp3` | `audio/mpeg` | Most common format |
| WAV | `.wav` | `audio/wav` | Uncompressed audio |
| M4A | `.m4a` | `audio/mp4` | Apple audio format |
| AAC | `.aac` | `audio/aac` | Advanced Audio Coding |
| OGG | `.ogg` | `audio/ogg` | Open source format |
| WebM | `.webm` | `audio/webm` | Web optimized |
| FLAC | `.flac` | `audio/flac` | Lossless compression |
| AMR | `.amr` | `audio/amr` | Mobile audio |
| 3GP | `.3gp` | `audio/3gpp` | Mobile video audio |

## 🔧 Whisper Models

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| `tiny` | 39 MB | Fastest | Good | Real-time |
| `base` | 74 MB | Fast | Better | General use |
| `small` | 244 MB | Medium | Good | Balanced |
| `medium` | 769 MB | Slow | Better | High quality |
| `large` | 1550 MB | Slowest | Best | Maximum accuracy |

## 📊 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNSUPPORTED_FORMAT` | 400 | Invalid audio format |
| `LIMIT_FILE_SIZE` | 400 | File too large |
| `LIMIT_FILE_COUNT` | 400 | Too many files |
| `LIMIT_UNEXPECTED_FILE` | 400 | Wrong field name |
| `ENOENT` | 404 | File not found |
| `EACCES` | 403 | Permission denied |

## 🧪 Testing Examples

### Upload Audio File (cURL)

```bash
curl -X POST http://localhost:5000/api/speech-to-text/transcribe \
  -F "audio=@recording.wav" \
  -F "language=en" \
  -F "model=base" \
  -F "enhanceAudio=true"
```

### Get Transcription

```bash
curl -X GET http://localhost:5000/api/speech-to-text/transcriptions/uuid-string
```

### Export as SRT

```bash
curl -X GET "http://localhost:5000/api/speech-to-text/transcriptions/uuid-string/export?format=srt" \
  -o transcription.srt
```

### Get Statistics

```bash
curl -X GET "http://localhost:5000/api/speech-to-text/stats?dateFrom=2024-01-01&dateTo=2024-01-31"
```

## 🔄 Integration Examples

### JavaScript/Fetch

```javascript
// Upload and transcribe
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('language', 'en');
formData.append('enhanceAudio', 'true');

const response = await fetch('/api/speech-to-text/transcribe', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Transcription:', result.data.text);
```

### Python/Requests

```python
import requests

# Upload file
with open('recording.wav', 'rb') as f:
    files = {'audio': f}
    data = {
        'language': 'en',
        'model': 'base',
        'enhanceAudio': 'true'
    }
    
    response = requests.post(
        'http://localhost:5000/api/speech-to-text/transcribe',
        files=files,
        data=data
    )
    
    result = response.json()
    print(f"Transcription: {result['data']['text']}")
```

## 🚀 Performance Optimization

### File Processing
- **Audio Enhancement**: Optional noise reduction and normalization
- **Format Conversion**: Automatic conversion to optimal format (16kHz WAV)
- **Cleanup**: Automatic temporary file cleanup

### Caching
- **Transcription Storage**: Persistent JSON storage
- **File Cleanup**: Automatic cleanup after processing
- **Memory Management**: Efficient memory usage

### Monitoring
- **Processing Time**: Track transcription performance
- **Success Rate**: Monitor transcription accuracy
- **Error Tracking**: Comprehensive error logging

---

**Speech-to-Text API** - Powered by Whisper AI for accurate, fast, and reliable audio transcription.
