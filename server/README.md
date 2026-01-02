# QMS Server - Microservices

This directory contains the microservices for the Quiz Management System.

## Services

### 1. Auth Service (Port 5001)
- **Functions**: User registration, login, JWT issuance.
- **Tech**: Express, Mongoose, bcryptjs, jsonwebtoken.

### 2. Quiz Service (Port 5002)
- **Functions**: Create and fetch quizzes.
- **Tech**: Express, Mongoose.

### 3. Assessment Service (Port 5003)
- **Functions**: Submit quiz attempts, grade submissions.
- **Tech**: Express, Mongoose, Axios (to fetch quiz data).

### 4. Reporting Service (Port 5004)
- **Functions**: Generate PDF reports.
- **Tech**: Express, Mongoose, Puppeteer.

## Setup

Each service requires a `.env` file with:
- `MONGO_URI`: Connection string to MongoDB.
- `PORT`: Service port.
- `JWT_SECRET`: (Auth only) Secret for JWT.
- `QUIZ_SERVICE_URL`: (Assessment only) URL to Quiz service.
- `ASSESSMENT_SERVICE_URL`: (Reporting only) URL to Assessment service.

## Installation & Running

Inside each service directory:
```bash
npm install
node src/index.js
```
Alternatively, use the root `npm run dev` to start all together.
