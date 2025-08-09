const mongoose = require('mongoose');
const config = require('./config');

console.log('=== Testing MongoDB Connection ===');
console.log('MongoDB URI:', config.MONGO_URI.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+@/, '$1****:****@'));

async function testConnection() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    // Check if users collection exists
    const usersCollection = collections.find(c => c.name === 'users');
    if (usersCollection) {
      console.log('\n✅ Users collection found');
      
      // Count users
      const User = require('./models/User');
      const userCount = await User.countDocuments();
      console.log(`Total users in database: ${userCount}`);
      
      // List first 5 users
      if (userCount > 0) {
        console.log('\nSample users:');
        const users = await User.find().limit(5).select('_id name email');
        console.log(users);
      }
    } else {
      console.log('❌ Users collection not found');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', {
      name: err.name,
      message: err.message,
      code: err.code,
      codeName: err.codeName,
      errorLabels: err.errorLabels,
      stack: err.stack
    });
    
    // Try to close the connection if it was opened
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

testConnection();
