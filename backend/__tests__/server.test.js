const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Set a longer timeout for MongoDB setup
jest.setTimeout(30000);

let mongoServer;
let app;

// Set up in-memory MongoDB for testing
beforeAll(async () => {
  try {
    console.log('Starting MongoDB Memory Server...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('MongoDB URI:', mongoUri);
    process.env.MONGODB_URI = mongoUri;
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Import the app after setting up the test environment
    app = require('../server');
    
    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Test setup error:', error);
    throw error;
  }
});

// Clean up after all tests are done
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

describe('Server', () => {
  it('should return 200 and a welcome message for the root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('V!B3 API running');
  });

  it('should return 404 for non-existent endpoints', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Not Found',
      error: expect.stringContaining('GET /non-existent-route')
    });
  });

  it('should handle errors properly', async () => {
    const res = await request(app)
      .post('/api/non-existent-route')
      .send({ test: 'data' });
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error');
  });

  it('should have CORS headers', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', 'http://test-origin.com');
      
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://test-origin.com');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
