# SecureVault - Encrypted Notes Management System

A production-ready, secure full-stack application for managing encrypted notes and files with role-based access control, comprehensive audit logging, and JWT authentication with refresh token rotation.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)

### Production Deployment

1. **Clone the repository**
```bash
git clone <repository-url>
cd securevault
```

2. **Set up environment variables**
```bash
# Create .env file in root directory
cat > .env << EOF
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_different_refresh_secret_key
ENCRYPTION_KEY=your_32_byte_encryption_key!!!
EOF
```

3. **Start with Docker Compose**
```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Seed Credentials

**Admin Account:**
- Email: admin@securevault.test
- Password: Admin@123

**User Account:**
- Email: user@securevault.test
- Password: User@123

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js 18, Express.js, PostgreSQL 15
- **Frontend**: React 18, React Query, Zustand, Tailwind CSS
- **Security**: AES-256-GCM encryption, bcrypt (cost 12), JWT with refresh rotation
- **Deployment**: Docker, Docker Compose, Nginx

### Security Features

1. **Authentication & Authorization**
   - JWT access tokens (15 min expiry)
   - Refresh token rotation with family detection
   - bcrypt password hashing (cost factor 12)
   - Role-based access control (Admin, User, Guest)
   - Password reset with time-limited tokens

2. **Data Protection**
   - AES-256-GCM encryption for note content at rest
   - Randomized filenames for uploaded files
   - MIME type validation for file uploads
   - No sequential IDs in URLs (UUIDs only)

3. **Security Headers**
   - Helmet.js for security headers
   - Content Security Policy (CSP)
   - CORS configured explicitly
   - X-Frame-Options, HSTS, etc.

4. **Input Validation & SQL Injection Prevention**
   - express-validator for input sanitization
   - Parameterized queries via Sequelize ORM
   - Mass assignment protection

5. **Rate Limiting**
   - 5 attempts per 15 minutes for auth endpoints
   - 3 attempts per hour for password reset
   - 100 requests per 15 minutes general limit

6. **Audit Logging**
   - Every sensitive action logged
   - IP address and user agent captured
   - Immutable logs (no edit/delete endpoints)
   - Real-time admin dashboard

## 📁 Project Structure

```
securevault/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & logger config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Encryption service
│   │   ├── scripts/        # Database seeding
│   │   └── server.js       # Entry point
│   ├── uploads/            # File storage
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   ├── store/          # Zustand stores
│   │   └── App.js
│   ├── public/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🔐 Security Decision: Refresh Token Rotation

 Implemented refresh token rotation to prevent replay attacks and token theft. When a user requests a new access token using their refresh token:

1. The old refresh token is immediately revoked
2. A new refresh token with the same family ID is issued
3. If a used token is presented again, the entire token family is revoked
4. This detects and mitigates token replay attacks

This approach balances security (detecting stolen tokens) with usability (allowing legitimate concurrent requests within a small window).

## 🧪 Testing Security

The application is hardened against:
- SQL/NoSQL Injection (parameterized queries)
- IDOR (strict ownership checks on every request)
- XSS (CSP headers, input validation)
- CSRF (SameSite cookies, CORS)
- Brute Force (rate limiting)
- Mass Assignment (explicit field filtering)
- Directory Traversal (randomized filenames, path validation)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - Logout
- `POST /api/auth/password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Notes
- `GET /api/notes?page=&limit=` - List notes (paginated)
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note (decrypted)
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Files
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file (max 5MB, JPEG/PNG/PDF)
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### Admin
- `GET /api/users` - List all users (Admin only)
- `PUT /api/users/:id` - Update user role/status (Admin only)
- `GET /api/audit/all` - View all audit logs (Admin only)

### Audit
- `GET /api/audit/my-logs` - View own audit logs

## 🛠️ Development

### Local Development (without Docker)

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:migrate
npm run db:seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing key (min 32 chars) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `ENCRYPTION_KEY` | AES-256 key (exactly 32 bytes) | Yes |
| `NODE_ENV` | environment (development/production) | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

## 📄 License

This project is for technical assessment purposes.

## ⚠️ Security Notice

This application implements security best practices but should undergo professional security auditing before production deployment with real user data.
