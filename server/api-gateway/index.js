const express = require('express');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Security & Logging
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'],
    credentials: true
}));

// Routing
// Auth Service
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL || 'http://auth-service:5001', {
    proxyReqPathResolver: (req) => {
        return '/api/auth' + req.url;
    }
}));

// Quiz Service
app.use('/api/quizzes', proxy(process.env.QUIZ_SERVICE_URL || 'http://quiz-service:5002', {
    proxyReqPathResolver: (req) => {
        return '/api/quizzes' + req.url;
    }
}));

// Assessment Service
app.use('/api/assessment', proxy(process.env.ASSESSMENT_SERVICE_URL || 'http://assessment-service:5003', {
    proxyReqPathResolver: (req) => {
        return '/api/assessment' + req.url;
    }
}));

// Reporting Service
app.use('/api/reporting', proxy(process.env.REPORTING_SERVICE_URL || 'http://reporting-service:5004', {
    proxyReqPathResolver: (req) => {
        return '/api/reporting' + req.url;
    }
}));

// Root
app.get('/', (req, res) => {
    res.send('API Gateway is running');
});

const PORT = process.env.PORT || 8002;
const server = app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
