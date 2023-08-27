const request = require('supertest');
const fs = require('fs');
const Database = require('better-sqlite3');
const FakeTimers = require('@sinonjs/fake-timers');
const { server } = require('../server');
const { DB_PATH } = require('../utils/constants');
const { sendMailMock } = require('./mocks.js');

jest.mock('nodemailer');

const now = new Date(2022, 7, 20, 12, 0, 0);
let clock;

beforeEach(() => {
  clock = FakeTimers.install({ now });
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  await server.close();
});

afterEach(() => {
  clock.uninstall();
  jest.clearAllMocks();
  const db = new Database(DB_PATH);
  db.prepare('DELETE FROM users').run();
});

test('Adding a new user', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });
  expect(res1.statusCode).toEqual(200);

  const res2 = await request(server).get('/api/auth/user').set('authorization', res1.body.token);
  expect(res2.statusCode).toEqual(200);
  expect(res2.body).toEqual({
    userId: res1.body.userId,
    email: 'partonrobertjames@gmail.com',
    firstName: 'John',
    lastName: 'Smith',
  });
});

test('Adding multiple users', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  const res2 = await request(server).get('/api/auth/user').set('authorization', res1.body.token);
  expect(res2.statusCode).toEqual(200);
  expect(res2.body).toEqual({
    userId: res1.body.userId,
    email: 'partonrobertjames@gmail.com',
    firstName: 'John',
    lastName: 'Smith',
  });

  const res3 = await request(server).post('/api/auth/user').send({
    email: 'therobbieparton@gmail.com',
    password: 'pswd',
    firstName: 'Bob',
    lastName: 'Lee',
  });
  expect(res3.body.userId).not.toEqual(res1.body.userId);

  const res4 = await request(server).get('/api/auth/user').set('authorization', res3.body.token);
  expect(res4.statusCode).toEqual(200);
  expect(res4.body).toEqual({
    userId: res3.body.userId,
    email: 'therobbieparton@gmail.com',
    firstName: 'Bob',
    lastName: 'Lee',
  });
});

test('Tokens expire after 3 days', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });
  expect(res1.statusCode).toEqual(200);
  const token = res1.body.token;

  const secondBeforeExpiry = new Date(now);
  secondBeforeExpiry.setDate(secondBeforeExpiry.getDate() + 3);
  secondBeforeExpiry.setSeconds(secondBeforeExpiry.getSeconds() - 1);
  clock.setSystemTime(secondBeforeExpiry);
  const res2 = await request(server).get('/api/auth/user').set('authorization', token).send();
  expect(res2.statusCode).toEqual(200);

  const secondOfExpiry = new Date(now);
  secondOfExpiry.setDate(secondOfExpiry.getDate() + 3);
  clock.setSystemTime(secondOfExpiry);
  const res3 = await request(server).get('/api/auth/user').set('authorization', token).send();
  expect(res3.statusCode).toEqual(401);
});

test('Adding user with already registered email - should fail', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.statusCode).toEqual(200);

  const res2 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'another password',
    firstName: 'Jane',
    lastName: 'Doe',
  });

  expect(res2.statusCode).toEqual(409);
});

test('Logging in a user', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.body.userId).toBeDefined();
  expect(res1.statusCode).toEqual(200);

  const res2 = await request(server).post('/api/auth/login').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
  });

  expect(res2.statusCode).toEqual(200);
  expect(typeof res2.body.token).toBe('string');
  expect(res2.body.userId).toBeDefined();
});

test('Logging in a user with unregistered email - should fail', async () => {
  const res2 = await request(server).post('/api/auth/login').send({
    email: 'jsnot@toodles.com',
    password: 'password',
  });

  expect(res2.statusCode).toEqual(404);
});

test('Logging in a user with wrong password - should fail', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.body.userId).toBeDefined();
  expect(res1.statusCode).toEqual(200);

  const res2 = await request(server).post('/api/auth/login').send({
    email: 'partonrobertjames@gmail.com',
    password: 'wrongpassword',
  });

  expect(res2.statusCode).toEqual(404);
});

test('Deleting a user', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.body.userId).toBeDefined();
  expect(res1.statusCode).toEqual(200);

  const token = res1.body.token;

  const res2 = await request(server).delete('/api/auth/user').set('authorization', token);

  expect(res2.statusCode).toEqual(200);
});

test('Deleting a user with invalid token - should fail', async () => {
  const token = 'wrongtoken';
  const res2 = await request(server).delete('/api/auth/user').set('authorization', token);
  expect(res2.statusCode).toEqual(401);
});

test('Sending a reset token', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.body.userId).toBeDefined();
  expect(res1.statusCode).toEqual(200);

  const res2 = await request(server)
    .post('/api/auth/reset')
    .send({ email: 'partonrobertjames@gmail.com' });

  expect(res2.statusCode).toEqual(200);
});

test('Sending a reset token but email not registered to user - should fail', async () => {
  const res2 = await request(server)
    .post('/api/auth/reset')
    .send({ email: 'partonrobertjames@gmail.com' });
  expect(res2.statusCode).toEqual(404);
});

test('Testing the password reset token with invalid userId - should fail', async () => {
  // register user
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  const userId = res1.body.userId;
  const invalidUserId = -1;

  // request reset
  const res2 = await request(server)
    .post('/api/auth/reset')
    .send({ email: 'partonrobertjames@gmail.com' });
  expect(res2.statusCode).toEqual(200);

  const token = res2.body.resetToken;

  // test reset token
  const res3 = await request(server).put('/api/auth/reset').send({
    userId: invalidUserId,
    token,
    password: 'newpasword',
  });

  expect(res3.statusCode).toEqual(401);
});

test('Testing the password reset token with invalid token - should fail', async () => {
  // register user
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  const userId = res1.body.userId;

  // request reset
  const res2 = await request(server)
    .post('/api/auth/reset')
    .send({ email: 'partonrobertjames@gmail.com' });
  expect(res2.statusCode).toEqual(200);

  const token = res2.body.resetToken;
  const invalidToken = 'wrongtoken';

  // test reset token
  const res3 = await request(server).put('/api/auth/reset').send({
    userId,
    token: invalidToken,
    password: 'newpasword',
  });

  expect(res3.statusCode).toEqual(401);
});

test('Testing the password reset token - should pass', async () => {
  // register user
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.statusCode).toEqual(200);
  const userId = res1.body.userId;

  // request reset
  const res2 = await request(server)
    .post('/api/auth/reset')
    .send({ email: 'partonrobertjames@gmail.com' });
  expect(res2.statusCode).toEqual(200);
  expect(sendMailMock).toHaveBeenCalledTimes(1);
  expect(sendMailMock.mock.calls[0][0]).toMatchObject({ to: 'partonrobertjames@gmail.com' });
  const token = res2.body.resetToken;

  // test reset token
  const res3 = await request(server).put('/api/auth/reset').send({
    userId,
    token,
    password: 'newpasword',
  });
  expect(res3.statusCode).toEqual(200);
});

test('Get user details from token', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.body.userId).toBeDefined();
  expect(res1.statusCode).toEqual(200);

  const token = res1.body.token;

  const res2 = await request(server).get('/api/auth/user').set('authorization', token);

  expect(res2.statusCode).toEqual(200);
});

test('Get user details from token with invalid token - should fail', async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  expect(res1.body.userId).toBeDefined();
  expect(res1.statusCode).toEqual(200);

  const invalidToken = -1;

  const res2 = await request(server).get('/api/auth/user').set('authorization', invalidToken);

  expect(res2.statusCode).toEqual(401);
});
