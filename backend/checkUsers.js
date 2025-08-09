const mongoose = require('mongoose');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Get the users collection directly
  const db = mongoose.connection.db;
  return db.collection('users').find({}).toArray();
})
.then(users => {
  console.log(`Found ${users.length} users in the database:`);
  users.forEach((user, index) => {
    console.log(`\nUser ${index + 1}:`);
    console.log(`- ID: ${user._id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Created at: ${user.createdAt}`);
  });
})
.catch(err => {
  console.error('Error:', err);
})
.finally(() => {
  mongoose.connection.close();
});
