const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const chatRoutes = require('./routes/chatRoutes');
const config = require('./config');

// Commented to trigger workflow run - 2
const app = express();

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  const errorId = `err_${Date.now()}`;
  
  // Log the complete error for debugging
  console.error(`\n=== [${errorId}] UNHANDLED ERROR ===`);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode || 500,
    stack: err.stack,
    originalError: err.originalError ? {
      name: err.originalError.name,
      message: err.originalError.message,
      code: err.originalError.code,
      stack: err.originalError.stack
    } : null,
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user || null
    }
  });
  
  // Determine the status code
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
    errorId: errorId,
    timestamp: new Date().toISOString()
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    if (err.originalError) {
      errorResponse.originalError = {
        name: err.originalError.name,
        message: err.originalError.message,
        stack: err.originalError.stack
      };
    }
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
});

// Health check
app.get('/', (req, res) => res.send('V!B3 API running'));

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
