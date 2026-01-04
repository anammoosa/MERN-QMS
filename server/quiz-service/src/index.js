const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const quizRoutes = require('./routes/quiz');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { createClient } = require('redis');

const app = express();

// Redis Client
// const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
// redisClient.on('error', (err) => {
//   if (err.code !== 'ECONNREFUSED') {
//     console.log('Redis Client Error (Caching disabled)', err);
//   }
// });
// redisClient.connect().then(() => console.log('Connected to Redis')).catch(() => { });

// Make redis available in req
app.use((req, res, next) => {
  req.redisClient = null; // (redisClient && redisClient.isOpen) ? redisClient : null;
  next();
});

// Security Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const importRoutes = require('./routes/import');

app.use('/api/quizzes', quizRoutes);
app.use('/api/quizzes/import', importRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qms-quiz';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Quiz Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Quiz Service running on port ${PORT}`));
