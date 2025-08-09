const mongoose = require('mongoose');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

// List all users in the database
const listUsers = async () => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password hashes
    console.log('All users in the database:');
    console.log(JSON.stringify(users, null, 2));
    return users;
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
listUsers().then(users => {
  console.log(`Found ${users.length} users in the database.`);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
