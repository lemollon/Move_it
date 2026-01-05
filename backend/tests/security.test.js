/**
 * Security middleware tests
 */

import request from 'supertest';
import express from 'express';
import {
  requestId,
  sanitizeInput,
  preventParamPollution,
  validateContentType,
  blockMaliciousAgents,
} from '../middleware/security.js';

// Create test app with security middleware
const createTestApp = () => {
  const app = express();

  // Apply middleware
  app.use(requestId);
  app.use(blockMaliciousAgents);
  app.use(express.json());
  app.use(sanitizeInput);
  app.use(preventParamPollution);

  // Test endpoints
  app.get('/test/request-id', (req, res) => {
    res.json({ requestId: req.id });
  });

  app.post('/test/sanitize', (req, res) => {
    res.json({ body: req.body });
  });

  app.get('/test/query', (req, res) => {
    res.json({ query: req.query });
  });

  return app;
};

describe('Security Middleware', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Request ID', () => {
    it('should add a request ID to each request', async () => {
      const response = await request(app)
        .get('/test/request-id')
        .expect(200);

      expect(response.body.requestId).toBeDefined();
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should use provided request ID if present', async () => {
      const customId = 'custom-request-id-123';
      const response = await request(app)
        .get('/test/request-id')
        .set('X-Request-ID', customId)
        .expect(200);

      expect(response.body.requestId).toBe(customId);
      expect(response.headers['x-request-id']).toBe(customId);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize script tags from input', async () => {
      const response = await request(app)
        .post('/test/sanitize')
        .send({
          message: 'Hello <script>alert("xss")</script> World',
        })
        .expect(200);

      expect(response.body.body.message).not.toContain('<script>');
      expect(response.body.body.message).toContain('Hello');
      expect(response.body.body.message).toContain('World');
    });

    it('should sanitize javascript: protocol', async () => {
      const response = await request(app)
        .post('/test/sanitize')
        .send({
          link: 'javascript:alert("xss")',
        })
        .expect(200);

      expect(response.body.body.link).not.toContain('javascript:');
    });

    it('should sanitize event handlers', async () => {
      const response = await request(app)
        .post('/test/sanitize')
        .send({
          content: '<div onclick="alert(1)">test</div>',
        })
        .expect(200);

      expect(response.body.body.content).not.toMatch(/onclick\s*=/i);
    });
  });

  describe('Parameter Pollution Prevention', () => {
    it('should take the last value when multiple values are provided', async () => {
      const response = await request(app)
        .get('/test/query?name=first&name=second')
        .expect(200);

      expect(response.body.query.name).toBe('second');
    });
  });

  describe('Malicious User Agent Blocking', () => {
    it('should block sqlmap user agent', async () => {
      const response = await request(app)
        .get('/test/request-id')
        .set('User-Agent', 'sqlmap/1.0')
        .expect(403);

      expect(response.body.error).toBe('Forbidden');
    });

    it('should allow normal user agents', async () => {
      await request(app)
        .get('/test/request-id')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        .expect(200);
    });
  });
});
