# Blog API Server

A production-ready modular monolithic REST API server for a blog application built with Node.js, TypeScript, and hexagonal architecture.

## 🏗️ Architecture

This application follows a **layered + hexagonal (ports and adapters) architecture** with clear separation of concerns:

```
src/
├── domain/              # Business entities and rules
│   ├── entities/        # Domain models
│   └── repositories/    # Repository interfaces
├── application/         # Use cases and business logic
│   └── services/        # Application services
├── infrastructure/      # External concerns
│   ├── database/        # Prisma + PostgreSQL
│   ├── cache/          # Redis implementation
│   ├── email/          # SMTP email service
│   ├── storage/        # File storage
│   ├── queue/          # BullMQ job queue
│   └── repositories/   # Repository implementations
├── presentation/        # HTTP layer
│   ├── controllers/     # Route handlers
│   ├── routes/         # Route definitions
│   ├── middleware/     # Express middleware
│   └── dto/            # Data transfer objects
├── config/             # Configuration and DI container
└── shared/             # Shared utilities and types
```

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with RBAC (admin, editor, reader)
- **Validation**: Request validation using class-validator with DTOs
- **Logging**: Structured logging with Pino including request IDs
- **Error Handling**: Global error handler with custom error classes
- **Security**: Helmet, CORS, rate limiting, XSS protection
- **Background Jobs**: BullMQ with Redis for email notifications
- **Audit Logging**: Track user actions with audit trails
- **Observability**: Health checks and Prometheus metrics
- **File Upload**: Image upload support with local/S3 storage
- **Full-Text Search**: PostgreSQL-based search functionality

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user profile

#### Posts
- `GET /api/v1/posts` - List posts with pagination and filtering
- `POST /api/v1/posts` - Create new post (editor/admin only)
- `GET /api/v1/posts/:id` - Get post by ID
- `GET /api/v1/posts/slug/:slug` - Get post by slug
- `PUT /api/v1/posts/:id` - Update post (editor/admin only)
- `DELETE /api/v1/posts/:id` - Delete post (editor/admin only)
- `GET /api/v1/posts/search?q=term` - Search posts
- `GET /api/v1/posts/author/:authorId` - Get posts by author

#### Comments
- `GET /api/v1/comments/post/:postId` - Get comments for post
- `POST /api/v1/comments` - Create comment (authenticated users)
- `GET /api/v1/comments/:id` - Get comment by ID
- `PUT /api/v1/comments/:id` - Update comment (comment author)
- `DELETE /api/v1/comments/:id` - Delete comment (admin/editor)
- `GET /api/v1/comments/replies/:parentId` - Get comment replies

#### Users
- `GET /api/v1/users` - List users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin only)

#### System
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Prometheus metrics
- `GET /api/v1/audit` - Audit logs (admin only)

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd blog-api-server
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup**:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

4. **Start development server**:
```bash
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blog_api"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"
EMAIL_FROM="noreply@yourdomain.com"

# File Upload
UPLOAD_DEST="uploads/"
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
```

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm start              # Start production server

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:deploy   # Deploy migrations (production)
npm run prisma:studio   # Open Prisma Studio

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues

# Docker
npm run docker:build   # Build Docker image
npm run docker:run     # Run Docker container
```

## 🐳 Docker

### Development with Docker Compose
```bash
docker-compose up -d
```

### Production Docker Build
```bash
docker build -t blog-api .
docker run -p 3000:3000 blog-api
```

## 🧪 Testing

The application includes comprehensive testing setup:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Unit Tests**: Domain logic and services
- **Integration Tests**: API endpoints and database operations
- **Coverage Requirements**: 80% minimum coverage threshold

## 📊 Monitoring & Observability

### Health Checks
- **Endpoint**: `GET /api/v1/health`
- **Checks**: Database, Redis, and job queue connectivity

### Metrics
- **Endpoint**: `GET /api/v1/metrics`
- **Format**: Prometheus metrics format
- **Includes**: HTTP request metrics, database connections, job queue status

### Logging
- **Format**: Structured JSON logs with Pino
- **Features**: Request IDs, error stack traces, performance metrics
- **Levels**: error, warn, info, debug

## 🔒 Security

### Implemented Security Measures
- **Authentication**: JWT tokens with configurable expiration
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Configurable request limits per IP
- **Input Validation**: DTO validation with class-validator
- **Security Headers**: Helmet.js for security headers
- **XSS Protection**: Input sanitization with xss-clean
- **CORS**: Configurable origin whitelist
- **Parameter Pollution**: Protection with hpp

### Role Permissions
- **READER**: Can read posts and comments, create comments
- **EDITOR**: Reader permissions + create/edit/delete posts
- **ADMIN**: Editor permissions + user management, audit logs

## 🚀 Deployment

### Production Checklist
1. Set strong JWT secret
2. Configure production database
3. Set up Redis instance
4. Configure SMTP for emails
5. Set appropriate CORS origins
6. Configure rate limiting
7. Set up monitoring and logging
8. Run database migrations
9. Build and deploy application

### CI/CD Pipeline
The project includes GitHub Actions workflow for:
1. **Lint**: Code quality checks
2. **Test**: Run test suite with coverage
3. **Build**: TypeScript compilation
4. **Docker**: Build and push container image

## 📚 API Documentation

Interactive API documentation is available via OpenAPI/Swagger:
- **Development**: http://localhost:3000/api-docs
- **Specification**: See `docs/api.yaml`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use ESLint configuration provided
- Maintain test coverage above 80%
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API specification

---

Built with ❤️ using Node.js, TypeScript, and hexagonal architecture principles.
