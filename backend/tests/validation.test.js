/**
 * Validation middleware tests
 */

import request from 'supertest';
import express from 'express';
import { authValidation, propertyValidation } from '../middleware/validation.js';

// Create test app with validation
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Test auth validation
  app.post('/test/register', authValidation.register, (req, res) => {
    res.json({ success: true, body: req.body });
  });

  app.post('/test/login', authValidation.login, (req, res) => {
    res.json({ success: true, body: req.body });
  });

  // Test property validation
  app.get('/test/properties', propertyValidation.list, (req, res) => {
    res.json({ success: true, query: req.query });
  });

  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 400).json({
      success: false,
      error: err.message,
    });
  });

  return app;
};

describe('Validation Middleware', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Auth Validation', () => {
    describe('Register validation', () => {
      it('should pass with valid registration data', async () => {
        const response = await request(app)
          .post('/test/register')
          .send({
            email: 'test@example.com',
            password: 'Password123',
            role: 'buyer',
            first_name: 'John',
            last_name: 'Doe',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should fail with invalid email', async () => {
        const response = await request(app)
          .post('/test/register')
          .send({
            email: 'invalid-email',
            password: 'Password123',
            role: 'buyer',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('email');
      });

      it('should fail with weak password', async () => {
        const response = await request(app)
          .post('/test/register')
          .send({
            email: 'test@example.com',
            password: '123',
            role: 'buyer',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Password');
      });

      it('should fail with invalid role', async () => {
        const response = await request(app)
          .post('/test/register')
          .send({
            email: 'test@example.com',
            password: 'Password123',
            role: 'invalid-role',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Invalid role');
      });
    });

    describe('Login validation', () => {
      it('should pass with valid login data', async () => {
        const response = await request(app)
          .post('/test/login')
          .send({
            email: 'test@example.com',
            password: 'Password123',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should fail with missing password', async () => {
        const response = await request(app)
          .post('/test/login')
          .send({
            email: 'test@example.com',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Property Validation', () => {
    describe('List validation', () => {
      it('should pass with valid query parameters', async () => {
        const response = await request(app)
          .get('/test/properties')
          .query({
            page: 1,
            limit: 20,
            minPrice: 100000,
            maxPrice: 500000,
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should fail with invalid page number', async () => {
        const response = await request(app)
          .get('/test/properties')
          .query({ page: -1 })
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should fail with limit exceeding maximum', async () => {
        const response = await request(app)
          .get('/test/properties')
          .query({ limit: 500 })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });
});
