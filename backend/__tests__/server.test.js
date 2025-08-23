const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');

let mongoServer;

// Set up in-memory MongoDB for testing
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after all tests are done
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
    expect(res.body).toEqual({
      success: false,
      message: 'Not Found',
      error: 'GET /non-existent-route'
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
