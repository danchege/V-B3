const mongoose = require('mongoose');
const config = require('../config');

// Enable debug mode for mongoose in development
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// Connection events
mongoose.connection.on('connecting', () => {
  console.log('MongoDB: Attempting to connect...');  
  console.log('MongoDB URI:', 
    config.MONGO_URI.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+@/, '$1****:****@'));
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB: Connected successfully');
  console.log('MongoDB Host:', mongoose.connection.host);
  console.log('MongoDB Database:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB: Connection error:', err.message);
  console.error('MongoDB Error Name:', err.name);
  console.error('MongoDB Error Code:', err.code);
  console.error('MongoDB Error Stack:', err.stack);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB: Disconnected');
});

// Close the connection when the Node process ends
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB: Connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

const connectDB = async () => {
  try {
    console.log('MongoDB: Attempting to connect...');
    
    const conn = await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds for socket timeout
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log(`MongoDB: Connected to ${conn.connection.host}`);
    console.log(`MongoDB: Database: ${conn.connection.name}`);
    
    return conn;
  } catch (err) {
    console.error('MongoDB: Connection failed:', {
      name: err.name,
      message: err.message,
      code: err.code,
      codeName: err.codeName,
      errorLabels: err.errorLabels,
      stack: err.stack
    });
    
    // Exit with non-zero status code to indicate error
    process.exit(1);
  }
};

module.exports = connectDB;
