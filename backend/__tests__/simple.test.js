const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set a longer timeout for MongoDB setup
jest.setTimeout(30000);

describe('Simple Test', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    try {
      console.log('Starting MongoDB Memory Server...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log('MongoDB URI:', mongoUri);
      
      // Connect to the in-memory database
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      // Create a simple Express app
      const express = require('express');
      app = express();
      app.get('/', (req, res) => {
        res.send('Test API is working');
      });
      
      console.log('Test environment setup complete');
    } catch (error) {
      console.error('Test setup error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.disconnect();
      if (mongoServer) {
        await mongoServer.stop();
      }
      console.log('Test environment cleaned up');
    } catch (error) {
      console.error('Test teardown error:', error);
      throw error;
    }
  });

  it('should respond to GET /', async () => {
    console.log('Running test...');
    const res = await request(app).get('/');
    console.log('Response status:', res.status);
    console.log('Response body:', res.text);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test API is working');
  });
});
