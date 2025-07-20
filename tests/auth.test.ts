import request from 'supertest';
import { container } from '../src/config/container';
import { App } from '../src/app';

describe('Authentication', () => {
  let app: any;

  beforeAll(async () => {
    const appInstance = container.get<App>('App');
    app = appInstance.getApp();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return validation error for invalid data', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'ab', // too short
        password: '123', // too short
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return conflict error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser1',
        password: 'password123',
      };

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const duplicateData = {
        ...userData,
        username: 'testuser2',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body.code).toBe('CONFLICT_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.code).toBe('AUTHENTICATION_ERROR');
    });
  });
});