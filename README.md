# NEXA Issuer Backend

A scalable NestJS backend with user authentication, JWT tokens, and MongoDB integration.

## 🚀 Features

- **Authentication**: Login/Signup with JWT tokens
- **User Management**: CRUD operations for users
- **MongoDB Integration**: Mongoose ODM with schemas
- **Role-Based Access Control**: Guards for protected routes
- **Input Validation**: DTOs with class-validator
- **Password Security**: Bcrypt hashing

## 📁 Project Structure

```
src/
├── infra/
│   └── database/           # Database configuration
│       └── database.module.ts
├── modules/
│   ├── auth/               # Authentication module
│   │   ├── decorators/     # Custom decorators
│   │   ├── dto/            # Data transfer objects
│   │   ├── guards/         # Auth guards
│   │   ├── services/       # Token service
│   │   ├── strategies/     # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   └── users/              # Users module
│       ├── dto/            # User DTOs
│       ├── schemas/        # Mongoose schemas
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
├── templates/              # Email templates (future)
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your values
   ```

3. **Configure MongoDB**:
   - Make sure MongoDB is running locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Application
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/nexa-issuer

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

## 🚀 Running the Application

```bash
# Development
yarn start:dev

# Production build
yarn build
yarn start:prod

# Debug mode
yarn start:debug
```

## 📝 API Endpoints

### Health Check
- `GET /api/v1` - Health check
- `GET /api/v1/health` - Health status

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get current user profile (Protected)
- `POST /api/v1/auth/change-password` - Change password (Protected)
- `POST /api/v1/auth/refresh` - Refresh JWT token (Protected)
- `POST /api/v1/auth/logout` - Logout (Protected)

### Users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - Get all users (Protected)
- `GET /api/v1/users/profile` - Get current user (Protected)
- `GET /api/v1/users/:id` - Get user by ID (Protected)
- `PATCH /api/v1/users/:id` - Update user (Protected)
- `DELETE /api/v1/users/:id` - Delete user (Protected)

## 📋 API Usage Examples

### Signup
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password@123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📦 Tech Stack

- **Framework**: NestJS 10.x
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt for password hashing

## 📄 License

MIT
