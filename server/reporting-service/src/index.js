const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const reportRoutes = require('./routes/report');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use('/api/reporting', reportRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qms-reporting';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Reporting Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Reporting Service running on port ${PORT}`));
