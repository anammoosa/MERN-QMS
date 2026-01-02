# MERN Quiz Management System (QMS)

A comprehensive, enterprise-grade Quiz Management System built with the MERN stack, featuring a microservices architecture, role-based access control, and a modern glassmorphic UI. This system enables instructors to create and manage quizzes while allowing students to take assessments with real-time grading and detailed reporting.

## 🎯 Features

### Core Functionality
- **User Management**: Role-based authentication (Admin, Instructor, Student)
- **Quiz Creation**: Rich quiz editor with multiple question types (MCQ, Multi-Select, True/False, Short Answer)
- **Quiz Taking**: Timed assessments with draft saving capabilities
- **Auto-Grading**: Automatic scoring with partial credit support
- **Batch Import**: Import quizzes from CSV or DOCX files
- **Analytics & Reporting**: Generate PDF reports with performance analytics
- **Real-time Updates**: Live quiz status and submission tracking

### Technical Features
- **Microservices Architecture**: Scalable, independent services
- **API Gateway**: Unified entry point for all client requests
- **Redis Caching**: Performance optimization for quiz data
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Joi schema validation for all endpoints
- **Rate Limiting**: Protection against brute-force attacks
- **Error Handling**: Centralized error management
- **Docker Support**: Containerized deployment ready

## 🏗️ Architecture

The system follows a microservices architecture with the following components:

```
┌─────────────┐
│   Client    │ (React + Vite)
│  Port 5173  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │ (Port 5000/8002)
└──────┬──────┘
       │
       ├──► Auth Service (5001)
       ├──► Quiz Service (5002)
       ├──► Assessment Service (5003)
       └──► Reporting Service (5004)
```

### Services Overview

1. **API Gateway** (Port 5000/8002)
   - Routes requests to appropriate microservices
   - Handles CORS and security headers
   - Request logging and monitoring

2. **Auth Service** (Port 5001)
   - User registration and authentication
   - JWT token generation and validation
   - User management (Admin only)
   - Role-based access control

3. **Quiz Service** (Port 5002)
   - Quiz CRUD operations
   - Batch import (CSV/DOCX)
   - Redis caching for performance
   - Quiz publishing/unpublishing

4. **Assessment Service** (Port 5003)
   - Quiz submission handling
   - Automatic grading with partial credit
   - Background worker for async processing
   - Submission status tracking

5. **Reporting Service** (Port 5004)
   - Performance analytics
   - PDF report generation
   - Student progress tracking

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Redis** - Caching
- **JWT** - Authentication
- **Joi** - Validation
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **Multer** - File uploads
- **Mammoth** - DOCX parsing
- **Puppeteer** - PDF generation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **MongoDB** - Database
- **Redis** - Cache store

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher (local instance or MongoDB Atlas)
- **Redis**: v7.0 or higher (optional, for caching)
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### Option 1: Using npm (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/anammoosa/MERN-QMS.git
   cd MERN-QMS
   ```

2. **Install all dependencies**
   ```bash
   npm install && npm run install-all
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

4. **Start Redis** (optional, for caching)
   ```bash
   # macOS
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   ```

5. **Seed Admin User** (first time only)
   ```bash
   node seedAdmin.js
   ```
   Default credentials:
   - Username: `admin`
   - Password: `adminpassword123`

6. **Start all services**
   ```bash
   npm run dev
   ```

   This will start:
   - API Gateway on port 5000
   - Auth Service on port 5001
   - Quiz Service on port 5002
   - Assessment Service on port 5003
   - Reporting Service on port 5004
   - React Client on port 5173

7. **Access the application**
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:5000

### Option 2: Using Docker (Recommended for Production)

1. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Seed Admin User**
   ```bash
   node seedAdmin.js
   ```

3. **Access the application**
   - Frontend: http://localhost:5173 (if client is running locally)
   - API Gateway: http://localhost:5000

## ⚙️ Configuration

Each service requires a `.env` file. Example configurations:

### API Gateway (.env)
```env
PORT=5000
AUTH_SERVICE_URL=http://localhost:5001
QUIZ_SERVICE_URL=http://localhost:5002
ASSESSMENT_SERVICE_URL=http://localhost:5003
REPORTING_SERVICE_URL=http://localhost:5004
```

### Auth Service (.env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/qms-auth
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

### Quiz Service (.env)
```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/qms-quiz
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

### Assessment Service (.env)
```env
PORT=5003
MONGO_URI=mongodb://localhost:27017/qms-assessment
REDIS_URL=redis://localhost:6379
QUIZ_SERVICE_URL=http://localhost:5002/api/quizzes
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

### Reporting Service (.env)
```env
PORT=5004
MONGO_URI=mongodb://localhost:27017/qms-reporting
ASSESSMENT_SERVICE_URL=http://localhost:5003/api/assessment
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```env
VITE_API_GATEWAY_URL=http://localhost:5000/api
```

**Important**: 
- Use the same `JWT_SECRET` across all services
- Update `MONGO_URI` for production (use MongoDB Atlas or secure connection)
- Change default passwords in production

## 📁 Project Structure

```
MERN-QMS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/         # UI components (Button, Card, etc.)
│   │   │   ├── QuizEditor.jsx
│   │   │   ├── QuizTaker.jsx
│   │   │   └── BatchUpload.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── styles/         # Global styles
│   └── package.json
│
├── server/                 # Microservices backend
│   ├── api-gateway/        # API Gateway service
│   ├── auth-service/       # Authentication service
│   │   ├── src/
│   │   │   ├── models/     # Mongoose models
│   │   │   ├── routes/     # Express routes
│   │   │   ├── middleware/ # Auth & error middleware
│   │   │   └── validation/ # Joi schemas
│   ├── quiz-service/       # Quiz management service
│   ├── assessment-service/ # Assessment & grading service
│   └── reporting-service/  # Analytics & reporting service
│
├── scripts/                # Utility scripts
│   ├── reset_admin.js     # Reset admin password
│   └── smoke_integration_test.js
│
├── docker-compose.yml      # Docker orchestration
├── seedAdmin.js           # Admin user seeder
└── package.json           # Root package.json
```

## 🔐 User Roles & Permissions

### Admin
- Create and manage all user accounts
- View all quizzes and submissions
- Access system-wide analytics
- Manage instructors and students

### Instructor
- Create, edit, and delete quizzes
- Publish/unpublish quizzes
- View submissions and grades
- Generate reports for their quizzes
- Create student accounts
- Import quizzes via CSV/DOCX

### Student
- Register account (default role)
- View available published quizzes
- Take quizzes (timed assessments)
- Save drafts before submission
- View own results and history

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new student
- `POST /login` - User login
- `POST /create-user` - Create user (Admin/Instructor only)
- `GET /users` - List all users (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Quizzes (`/api/quizzes`)
- `GET /` - Get all published quizzes
- `GET /:id` - Get quiz by ID
- `POST /create` - Create quiz (Instructor only)
- `PUT /:id` - Update quiz (Instructor only)
- `DELETE /:id` - Delete quiz (Instructor only)
- `POST /import/import-csv` - Import from CSV (Instructor only)
- `POST /import-docx` - Import from DOCX (Instructor only)

### Assessment (`/api/assessment`)
- `POST /submit` - Submit quiz answers
- `GET /submissions/:quizId` - Get submissions for quiz (Instructor only)
- `GET /my-submissions` - Get own submissions (Student)

### Reporting (`/api/reporting`)
- `GET /quiz/:quizId` - Get quiz analytics
- `GET /student/:studentId` - Get student performance
- `GET /pdf/:quizId` - Generate PDF report

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Protection against brute-force attacks (100 requests/15min)
- **Helmet.js**: Security headers protection
- **CORS**: Configured for allowed origins
- **Input Validation**: Joi schema validation on all endpoints
- **Role-Based Access Control**: Middleware protection on routes
- **Error Handling**: Centralized error management without exposing internals

## 📜 Available Scripts

### Root Level
```bash
npm run install-all      # Install dependencies for all services
npm run dev              # Start all services + client concurrently
npm run start-server     # Start all backend services
npm run start-client     # Start React client only
npm run start-auth       # Start auth service only
npm run start-quiz       # Start quiz service only
npm run start-assessment # Start assessment service only
npm run start-reporting  # Start reporting service only
npm run start-gateway    # Start API gateway only
```

### Client
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🧪 Testing

Run the smoke integration test to verify all services are working:

```bash
node scripts/smoke_integration_test.js
```

This test will:
- Check API Gateway connectivity
- Test user registration and login
- Create test users (Admin, Instructor, Student)
- Create and fetch quizzes
- Verify end-to-end functionality

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Individual Service Dockerfiles

Each service has its own Dockerfile. To build individually:

```bash
cd server/[service-name]
docker build -t qms-[service-name] .
docker run -p [port]:[port] qms-[service-name]
```

## 🔄 Development Workflow

1. **Start MongoDB and Redis** (if not using Docker)
2. **Install dependencies**: `npm run install-all`
3. **Seed admin user**: `node seedAdmin.js`
4. **Start development**: `npm run dev`
5. **Make changes** to any service
6. **Test changes** using the smoke test or manual testing
7. **Commit and push** changes

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String (unique, required),
  password: String (hashed, required),
  role: Enum ['Student', 'Instructor', 'Admin'],
  timestamps: true
}
```

### Quizzes Collection
```javascript
{
  title: String (required),
  description: String,
  isPublished: Boolean,
  instructorId: ObjectId (required),
  questions: [{
    text: String,
    type: Enum ['MCQ', 'Multi-Select', 'True/False', 'Short Answer'],
    options: [String],
    correctAnswer: Mixed,
    points: Number
  }],
  startTime: Date,
  endTime: Date,
  duration: Number (minutes),
  timestamps: true
}
```

### Submissions Collection
```javascript
{
  userId: ObjectId (required),
  quizId: ObjectId (required),
  answers: [{
    questionId: ObjectId,
    selectedOptions: Mixed
  }],
  score: Number,
  status: Enum ['Draft', 'Submitted'],
  submittedAt: Date,
  timestamps: true
}
```

## 🚨 Troubleshooting

### Services won't start
- Check if MongoDB is running: `mongosh` or check MongoDB service
- Verify ports are not in use: `lsof -i :5001` (check each port)
- Check `.env` files are configured correctly

### Authentication issues
- Ensure `JWT_SECRET` is the same across all services
- Check token expiration (default: 30 days)
- Verify CORS settings allow your frontend URL

### Database connection errors
- Verify MongoDB URI is correct
- Check MongoDB is accessible (firewall, network)
- Ensure database names don't conflict

### Redis connection errors
- Redis is optional; services will work without it (caching disabled)
- If using Redis, ensure it's running: `redis-cli ping`

## 📝 Notes

- **Default Admin Credentials**: Change immediately in production
- **JWT Secret**: Use a strong, random secret in production
- **MongoDB**: Each service uses a separate database for isolation
- **CORS**: Update allowed origins for production deployment
- **Rate Limiting**: Configure Redis store for multi-instance deployments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Project Owner** - Initial work

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Microservices architecture for scalability
- Enterprise-grade security features

---

**Note**: This is an enterprise-ready application. For production deployment, ensure all security configurations are properly set, use environment variables for sensitive data, and follow security best practices.
