const mongoose = require('mongoose');
const config = require('./config');

console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', config.MONGO_URI);

mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB');
  console.log('Available collections:');
  
  // List all collections in the database
  return mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      if (collections.length === 0) {
        console.log('No collections found in the database');
      } else {
        console.log('Collections:');
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
      }
    });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
})
.finally(() => {
  mongoose.connection.close();
});
