# Backend Server

Node.js/Express backend for the English Learning Platform.

## Setup

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Install MongoDB:**

**Option A: Local MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Create free account: https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update MONGODB_URI in .env

4. **Start development server:**
```bash
npm run dev
```

Server will run on http://localhost:5000

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Protected Routes

All protected routes require the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User model
│   ├── Progress.js          # Progress tracking
│   ├── Question.js          # Question bank
│   └── ...
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── lessons.js           # Lesson routes
│   ├── progress.js          # Progress routes
│   └── ...
├── middleware/
│   ├── authenticate.js      # JWT auth middleware
│   ├── rateLimiter.js       # Rate limiting
│   └── errorHandler.js      # Error handling
├── services/
│   ├── emailService.js      # Email sending
│   ├── aiService.js         # OpenAI integration
│   └── ...
├── .env.example             # Environment template
├── server.js                # Main server file
└── package.json
```

## Environment Variables

See `.env.example` for all required environment variables.

**Required for basic functionality:**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `EMAIL_*`: Email service credentials

**Required for AI features:**
- `OPENAI_API_KEY`: OpenAI API key

**Required for premium features:**
- `STRIPE_SECRET_KEY`: Stripe payment processing
- `GOOGLE_TRANSLATE_API_KEY`: Translation API
- `GOOGLE_VISION_API_KEY`: OCR/Camera features

## Development

```bash
# Run with auto-reload
npm run dev

# Run tests
npm test

# Seed database with sample data
npm run seed
```

## Production

```bash
# Start production server
npm start
```

## API Rate Limits

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- AI endpoints: 20 requests per hour (free tier)
- Translation: 50 requests per hour (free tier)

Premium users have unlimited access to all endpoints.

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

## Success Responses

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```
