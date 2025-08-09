const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`\n=== [${requestId}] AUTH MIDDLEWARE ===`);
  console.log(`[${requestId}] Request URL:`, req.originalUrl);
  console.log(`[${requestId}] Request method:`, req.method);
  
  const authHeader = req.headers.authorization;
  console.log(`[${requestId}] Authorization header:`, authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[${requestId}] No valid auth header found`);
    return res.status(401).json({ 
      success: false,
      message: 'No token provided.',
      requestId: requestId
    });
  }
  
  const token = authHeader.split(' ')[1];
  console.log(`[${requestId}] Token found, verifying...`);
  
  try {
    console.log(`[${requestId}] Verifying JWT token with secret:`, 
      config.JWT_SECRET === 'your_jwt_secret_key_here' ? 'Using default secret' : 'Using custom secret');
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log(`[${requestId}] Token verified successfully. Decoded payload:`, JSON.stringify(decoded, null, 2));
    
    // Attach user to request
    req.user = { 
      id: decoded.id,
      // Add any other user properties you need
    };
    
    console.log(`[${requestId}] User attached to request:`, JSON.stringify(req.user, null, 2));
    next();
  } catch (err) {
    console.error(`[${requestId}] Token verification failed:`, {
      name: err.name,
      message: err.message,
      expiredAt: err.expiredAt,
      stack: err.stack
    });
    
    let statusCode = 401;
    let errorMessage = 'Invalid token';
    
    if (err.name === 'TokenExpiredError') {
      statusCode = 403;
      errorMessage = 'Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    } else {
      statusCode = 500;
      errorMessage = 'Server error during token verification';
    }
    
    res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      requestId: requestId
    });
  }
};
