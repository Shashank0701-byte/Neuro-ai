# NeuroAid Backend API

A robust Node.js/Express backend API for managing dynamic content in the NeuroAid application, with a focus on the "How It Works" section content management system.

## 🚀 Features

- **Dynamic Content Management**: Full CRUD operations for "How It Works" section
- **Admin Authentication**: JWT-based authentication with role-based access control
- **Rate Limiting**: Protection against abuse with configurable limits
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: CORS, Helmet, and other security middleware
- **File-based Database**: Simple JSON file storage (easily replaceable with real DB)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server:**
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
