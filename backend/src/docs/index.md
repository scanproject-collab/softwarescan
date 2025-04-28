# Plataforma Scan API Documentation

Welcome to the Plataforma Scan API documentation. This API provides endpoints for managing users, posts, notifications, and integrations with external services for both the mobile and web versions of the Plataforma Scan software.

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. Most endpoints require an `Authorization` header with a valid token.

Example:
```
Authorization: Bearer your_jwt_token
```

## User Roles

The system supports various user roles with different permissions:

- **Admin**: Can manage all aspects of the system, including approving/rejecting operators
- **Manager**: Can manage institutions and view analytics
- **Operator**: Can create and manage posts

## Rate Limiting

To ensure system stability, API requests are rate-limited. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests

## Common Response Codes

| Code | Description |
|------|-------------|
| 200  | Success     |
| 400  | Bad Request |
| 401  | Unauthorized|
| 403  | Forbidden   |
| 404  | Not Found   |
| 500  | Server Error|

## API Versioning

The current API version is v1. The version is included in the URL path: `/api/v1/...`

## Support

For API support, please contact support@plataformascan.com or open an issue in our GitHub repository. 