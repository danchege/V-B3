// Triggering backend CI/CD workflow - Run 7 (Vercel deployment fix - updated CORS)
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const chatRoutes = require('./routes/chatRoutes');
const config = require('./config');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://127.0.0.1:42533',  // Browser preview proxy
  'https://vib3-inky.vercel.app'  // Production Vercel deployment
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in test environment
    if (process.env.NODE_ENV === 'test' || !origin) {
      callback(null, true);
      return;
    }
    
    // In development, allow localhost and 127.0.0.1 with any port
    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/);
      if (isLocalhost || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
        return;
      }
    }
    
    // In production, only allow specific origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('V!B3 API running');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

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
const PORT = config.port || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
