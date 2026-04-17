// Example tests for authentication controller
// Shows how to test API endpoints with supertest

const request = require('supertest');
const app = require('../../server');

describe('Auth Controller - Health Check', () => {
  test('should return server health status', async () => {
    const response = await request(app)
      .get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is running');
  });
});

describe('Auth Endpoints - 404 Handling', () => {
  test('should return 404 for non-existent route', async () => {
    const response = await request(app)
      .get('/api/non-existent');
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});

describe('Auth Endpoints - Validation', () => {
  test('should require email for login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ password: 'password123' });
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('should require password for login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com' });
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

describe('Auth Endpoints - Rate Limiting', () => {
  test('auth endpoints should have rate limiting', async () => {
    // Make multiple requests rapidly
    const requests = [];
    for (let i = 0; i < 7; i++) {
      requests.push(
        request(app)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'wrong' })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // At least one should be rate limited (429)
    const hasRateLimit = responses.some(r => r.status === 429);
    expect(hasRateLimit).toBe(true);
  }, 30000); // Increase timeout for this test
});
