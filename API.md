# VirtuHelpX API Documentation

## Table of Contents

- [Authentication](#authentication)
- [Subscriptions](#subscriptions)
- [Documents](#documents)
- [Chat & Questions](#chat--questions)
- [Admin](#admin)
- [Files](#files)

## Authentication

### Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "string",
  "subscription": {
    "plan": "string",
    "documentsLimit": "number",
    "questionsLimit": "number",
    "questionsUsed": "number",
    "validUntil": "date",
    "status": "string"
  }
}
```

### Get Session

```http
GET /api/auth/session
```

**Response:**

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  },
  "subscription": {
    "plan": "string",
    "status": "string"
  }
}
```

## Subscriptions

### Get Current Subscription

```http
GET /api/subscriptions/current
```

**Response:**

```json
{
  "plan": "string",
  "documentsPerMonth": "number",
  "questionsPerMonth": "number",
  "questionsUsed": "number",
  "validUntil": "date",
  "status": "string"
}
```

### Upgrade Subscription

```http
POST /api/subscriptions/upgrade
```

**Request Body:**

```json
{
  "plan": "string" // "FREE", "PROFESSIONAL", "ENTERPRISE"
}
```

### Track Usage

```http
POST /api/subscriptions/usage
```

**Request Body:**

```json
{
  "type": "string" // "question" or "document"
}
```

## Documents

### Upload Document

```http
POST /api/documents
```

**Request Body:**

```json
{
  "title": "string",
  "content": "string",
  "userId": "string"
}
```

### Get Documents

```http
GET /api/documents?userId=string
```

**Response:**

```json
[
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "createdAt": "date",
    "uploadedBy": "string",
    "isPublic": "boolean"
  }
]
```

## Chat & Questions

### Create Thread

```http
POST /api/assistants/threads
```

**Response:**

```json
{
  "threadId": "string"
}
```

### Send Message

```http
POST /api/assistants/threads/{threadId}/messages
```

**Request Body:**

```json
{
  "content": "string"
}
```

### Upload File

```http
POST /api/assistants/files/code-interpreter
```

**Form Data:**

- file: File

**Response:**

```json
{
  "fileId": "string"
}
```

## Admin

### Admin Login

```http
POST /api/admin/auth
```

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

### Get Admin Stats

```http
GET /api/admin/stats
```

**Response:**

```json
{
  "users": {
    "total": "number"
  },
  "subscriptions": {
    "FREE": "number",
    "PROFESSIONAL": "number",
    "ENTERPRISE": "number"
  },
  "activity": {
    "totalQuestions": "number",
    "totalDocuments": "number"
  },
  "subscriptionDetails": [
    {
      "userId": "string",
      "email": "string",
      "plan": "string",
      "questionsUsed": "number",
      "documentsUsed": "number",
      "validUntil": "date",
      "status": "string"
    }
  ],
  "usageMetrics": [
    {
      "plan": "string",
      "avgQuestionsPerUser": "number",
      "avgDocumentsPerUser": "number",
      "totalRevenue": "number"
    }
  ]
}
```

### Get Users List

```http
GET /api/admin/users
```

**Response:**

```json
[
  {
    "id": "string",
    "email": "string",
    "name": "string",
    "username": "string",
    "role": "string",
    "createdAt": "date",
    "subscription": {
      "plan": "string",
      "status": "string",
      "validUntil": "date",
      "documentsPerMonth": "number",
      "questionsPerMonth": "number",
      "questionsUsed": "number",
      "documentsUsed": "number"
    },
    "stats": {
      "questions": "number",
      "documents": "number"
    }
  }
]
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Error message describing the issue"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "error": "Insufficient permissions or limits reached"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error message"
}
```

## Rate Limiting

- Free Plan: 100 requests per minute
- Professional Plan: 500 requests per minute
- Enterprise Plan: 1000 requests per minute

## Authentication

All API endpoints (except /auth/register and /auth/login) require authentication using JWT tokens.

Include the JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

## Subscription Limits

### Free Plan

- 3 documents per month
- 20 questions per month

### Professional Plan

- 50 documents per month
- 200 questions per month

### Enterprise Plan

- 200 documents per month
- 1000 questions per month
