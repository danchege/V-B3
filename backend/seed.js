const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const config = require('./config');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB with URI:', config.MONGO_URI);
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    process.exit(1);
  }
};

// Generate random user data
const generateUsers = async (count = 5) => {
  const users = [];
  
  // Create test users
  for (let i = 1; i <= count; i++) {
    const user = new User({
      name: `Test User ${i}`,
      email: `test${i}@example.com`,
      password: 'password123',  // Let the pre-save hook handle hashing
      bio: `This is a test user ${i}`,
      age: 20 + i,
      gender: i % 2 === 0 ? 'male' : 'female',
      photos: [
        `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i}.jpg`
      ],
      location: {
        type: 'Point',
        coordinates: [
          -122.431297 + (Math.random() * 0.1) - 0.05, // Randomize longitude
          37.773972 + (Math.random() * 0.1) - 0.05,   // Randomize latitude
        ]
      },
      preferences: {
        gender: ['male', 'female'],
        lookingFor: ['male', 'female'],
        distance: 50,
        ageRange: { min: 18, max: 50 }
      }
    });
    
    const savedUser = await user.save();
    users.push(savedUser);
    console.log(`Created user: ${savedUser.email}`);
  }
  
  return users;
};

// Generate chats between users
const generateChats = async (users) => {
  const chats = [];
  
  // Create direct chats between users
  for (let i = 0; i < users.length - 1; i++) {
    const user1 = users[i];
    const user2 = users[i + 1];
    
    const chat = new Chat({
      type: 'direct',
      participants: [
        { user: user1._id, role: 'member' },
        { user: user2._id, role: 'member' }
      ],
      otherParticipant: user2._id,
      createdBy: user1._id
    });
    
    const savedChat = await chat.save();
    chats.push(savedChat);
    console.log(`Created chat between ${user1.name} and ${user2.name}`);
    
    // Add chat reference to users
    await User.updateMany(
      { _id: { $in: [user1._id, user2._id] } },
      { $addToSet: { chats: savedChat._id } }
    );
  }
  
  return chats;
};

// Generate messages in chats
const generateMessages = async (chats, users) => {
  const messages = [];
  const messageContents = [
    'Hey there! 👋',
    'How are you doing today?',
    'Nice to meet you!',
    'What are your hobbies?',
    'I love hiking and reading books.',
    'Have you been to that new cafe downtown?',
    'What kind of music do you like?',
    'Let\'s chat more later!',
    '😊',
    '👍'
  ];
  
  for (const chat of chats) {
    const participants = chat.participants.map(p => p.user);
    
    // Generate 5-10 messages per chat
    const messageCount = 5 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < messageCount; i++) {
      const sender = participants[Math.floor(Math.random() * participants.length)];
      const content = messageContents[Math.floor(Math.random() * messageContents.length)];
      const timestamp = new Date(Date.now() - (i * 1000 * 60 * 5)); // 5 minutes apart
      
      const message = new Message({
        chat: chat._id,
        sender: sender,
        content: content,
        type: 'text',
        status: 'delivered',
        readBy: [{ user: sender, readAt: timestamp }],
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      const savedMessage = await message.save();
      messages.push(savedMessage);
      
      // Update last message in chat
      if (i === messageCount - 1) {
        chat.lastMessage = savedMessage._id;
        await chat.save();
      }
    }
    
    console.log(`Added ${messageCount} messages to chat ${chat._id}`);
  }
  
  return messages;
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding process...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    console.log('Successfully cleared existing data');

    // Generate test users
    console.log('Generating test users...');
    const users = await generateUsers(5);
    console.log(`Successfully created ${users.length} test users`);
    console.log('Sample user:', {
      email: users[0]?.email,
      password: 'password123',
      _id: users[0]?._id
    });

    // Generate test chats
    console.log('Generating test chats...');
    const chats = await generateChats(users);
    console.log(`Successfully created ${chats.length} test chats`);

    // Generate test messages
    console.log('Generating test messages...');
    const messages = await generateMessages(chats, users);
    console.log(`Successfully created ${messages.length} test messages`);

    // Verify data was saved
    const userCount = await User.countDocuments();
    const chatCount = await Chat.countDocuments();
    const messageCount = await Message.countDocuments();
    
    console.log('\nDatabase seeding completed successfully!');
    console.log('Final counts:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Chats: ${chatCount}`);
    console.log(`- Messages: ${messageCount}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    if (err.stack) {
      console.error('Error stack:', err.stack);
    }
    process.exit(1);
  }
};

// Run the seed function
connectDB().then(() => {
  seedDatabase();
});
