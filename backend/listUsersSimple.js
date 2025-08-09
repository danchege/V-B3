const mongoose = require('mongoose');
require('dotenv').config();

async function listUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get users collection
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`\nFound ${users.length} users in the database:`);
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`- Email: ${user.email}`);
      console.log(`- ID: ${user._id}`);
      console.log(`- Name: ${user.name}`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();
