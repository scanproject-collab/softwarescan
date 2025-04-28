# Plataforma Scan Backend

![Version](https://img.shields.io/badge/version-3.5.0-blue)
![Node](https://img.shields.io/badge/node-18.x-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Express](https://img.shields.io/badge/express-4.x-lightgrey)
![Prisma](https://img.shields.io/badge/prisma-6.x-orange)

The Backend for the Plataforma Scan system - providing API services for both mobile and web applications.

## Overview

Plataforma Scan Backend is a RESTful API service built with Node.js, Express, TypeScript, and Prisma ORM. It provides a comprehensive set of endpoints for user management, authentication, content management, and integrations with external services like Google Maps, AWS S3, and notification services.

## Key Features

- **Robust Authentication System**: JWT-based authentication with role-based access control
- **User Management**: Support for different user roles (admin, manager, operator)
- **Content Management**: Create, read, update, and delete functionality for posts and related data
- **Geospatial Features**: Integration with Google Maps API for location-based services
- **File Storage**: AWS S3 integration for storing and retrieving files
- **Notifications**: Push notification service for real-time alerts
- **Security**: Password encryption, token validation, and secure API endpoints

## API Documentation

The API is thoroughly documented using OpenAPI 3.1 specifications, rendered with Redoc. This documentation provides a comprehensive overview of all available endpoints, request/response formats, and authentication requirements.

### Accessing Documentation

You can access the API documentation by following these steps:

1. **Generate the documentation**:
   ```bash
   pnpm run docs
   ```

2. **Start the server**:
   ```bash
   pnpm run dev
   ```

3. **Access the docs**:
   Open your browser and navigate to:
   ```
   http://localhost:3000/api-docs
   ```

The documentation is served as a static HTML page that provides an interactive API explorer powered by Redoc.

### Documentation Features

- Interactive API explorer with syntax highlighting
- Request/response schema details
- Authentication information
- Detailed sample payloads
- OpenAPI 3.1 standard compliant
- Mobile-friendly responsive design

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB (local or Atlas)
- AWS Account (for S3 storage)
- Google Maps API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. Set up the database:
   ```bash
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   pnpm run dev
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority"

# Authentication
SECRET_KEY_SESSION="your-secret-key-for-jwt"
TOKEN_EXPIRATION="24h"

# Email
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
EMAIL_SERVICE="gmail"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Google Maps
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# OneSignal
ONESIGNAL_APP_ID="your-onesignal-app-id"
ONESIGNAL_REST_API_KEY="your-onesignal-api-key"
```

## Project Structure

```
backend/
│
├── api/
│   └── app.ts            # Express application setup
│
├── prisma/
│   └── schema.prisma     # Database schema definition
│
├── src/
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # API routes definition
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── docs/             # API documentation resources
│
├── api-docs/             # Generated API documentation
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Development

### Available Scripts

- `pnpm run dev` - Start development server with hot-reload
- `pnpm start` - Start production server
- `pnpm run docs` - Generate API documentation
- `pnpm run vercel-build` - Build for Vercel deployment

### Documenting API Endpoints

When adding new endpoints, document them by updating the OpenAPI definitions in `scalar.json`. For example:

```json
"/auth/login": {
  "post": {
    "summary": "Login to the system",
    "description": "Authenticate a user and return a JWT token",
    "tags": ["Authentication"],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "required": ["email", "password"],
            "properties": {
              "email": {
                "type": "string",
                "format": "email"
              },
              "password": {
                "type": "string",
                "format": "password"
              }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Login successful"
      },
      "401": {
        "description": "Invalid credentials"
      }
    }
  }
}
```

## Deployment

The API is configured for deployment on Vercel with the included `vercel.json` configuration file.

To deploy:

1. Connect your repository to Vercel
2. Configure the environment variables in Vercel
3. Deploy the project

## License

This project is proprietary software. All rights reserved.

## Contact

For support or inquiries, please contact:

- Email: support@plataformascan.com

---
