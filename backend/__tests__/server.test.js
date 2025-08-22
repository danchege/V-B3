const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

// Close the MongoDB connection after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Server', () => {
  it('should return 200 and a welcome message for the root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('V!B3 API running');
  });

  it('should return 404 for non-existent endpoints', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toEqual(404);
  });

  it('should handle errors properly', async () => {
    // Test error handling by making a request to a route that might throw an error
    const res = await request(app)
      .post('/api/non-existent-route')
      .send({ test: 'data' });
    
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });

  it('should have CORS headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
