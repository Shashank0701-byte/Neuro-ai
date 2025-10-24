const request = require('supertest');
const app = require('../server');

describe('NeuroAid Backend API Tests', () => {
  let authToken;
  let server;

  beforeAll(async () => {
    // Start server for testing
    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    // Close server after tests
    if (server) {
      server.close();
    }
  });

  describe('Health Check', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('role', 'admin');

      // Store token for subsequent tests
      authToken = response.body.token;
    });

    test('POST /api/auth/login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication failed');
    });

    test('GET /api/auth/me with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'admin');
    });

    test('GET /api/auth/me without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });

  describe('How It Works API', () => {
    test('GET /api/how-it-works should return complete content', async () => {
      const response = await request(app)
        .get('/api/how-it-works')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('header');
      expect(response.body.data).toHaveProperty('steps');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('validation');
      expect(response.body).toHaveProperty('metadata');
    });

    test('GET /api/how-it-works/steps should return all steps', async () => {
      const response = await request(app)
        .get('/api/how-it-works/steps')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/how-it-works/steps/1 should return specific step', async () => {
      const response = await request(app)
        .get('/api/how-it-works/steps/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('details');
    });

    test('GET /api/how-it-works/steps/999 should return 404', async () => {
      const response = await request(app)
        .get('/api/how-it-works/steps/999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Step not found');
    });

    test('PUT /api/how-it-works/steps/1 without auth should return 401', async () => {
      const response = await request(app)
        .put('/api/how-it-works/steps/1')
        .send({
          id: 1,
          title: 'Updated Title'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });

    test('GET /api/how-it-works/header should return header content', async () => {
      const response = await request(app)
        .get('/api/how-it-works/header')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('badge');
    });

    test('GET /api/how-it-works/summary should return summary content', async () => {
      const response = await request(app)
        .get('/api/how-it-works/summary')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalTime');
      expect(response.body.data).toHaveProperty('description');
    });
  });

  describe('Admin Operations', () => {
    test('GET /api/how-it-works/metadata with auth should return metadata', async () => {
      const response = await request(app)
        .get('/api/how-it-works/metadata')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('lastUpdated');
      expect(response.body.data).toHaveProperty('version');
    });

    test('PUT /api/how-it-works/header with auth should update header', async () => {
      const newHeader = {
        badge: {
          text: "Updated Process",
          icon: "Brain"
        },
        title: "Updated How NeuroAid Works",
        subtitle: "From Input to Insights",
        description: "Updated description for testing purposes."
      };

      const response = await request(app)
        .put('/api/how-it-works/header')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newHeader)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Header updated successfully');
      expect(response.body.data.title).toBe('Updated How NeuroAid Works');
    });
  });

  describe('Rate Limiting', () => {
    test('Should handle rate limiting on auth endpoints', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              username: 'admin',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least some should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('Should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });

    test('Should validate request body for login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'a', // Too short
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation Error');
      expect(response.body).toHaveProperty('details');
    });
  });
});

module.exports = app;
