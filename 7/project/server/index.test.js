const request = require('supertest');
const app = require('./index');

describe('POST /register', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: 'jan', password: '1234' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Registered');
  });
});
