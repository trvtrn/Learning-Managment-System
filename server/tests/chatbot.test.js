const request = require('supertest');
const fs = require('fs');
const { server } = require('../server');
const { db } = require('../scripts/database');
const { DB_PATH } = require('../utils/constants');
const { chatResponseMock } = require('./mocks');

jest.mock('openai');

let userToken1;
let userId1;

function expectChatbotIsCalledWith(message) {
  expect(chatResponseMock).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: expect.arrayContaining([expect.objectContaining({ content: message })]),
    })
  );
}

beforeAll(async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'js@toodles.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  userToken1 = res1.body.token;
  userId1 = res1.body.userId;
});

afterEach(() => {
  jest.clearAllMocks();
  db.prepare('DELETE FROM chatbotMessages').run();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  await server.close();
});

test('Sending a message', async () => {
  const res1 = await request(server).post('/api/chatbot').set('authorization', userToken1).send({
    message: 'What is 1 + 1?',
  });
  const message = res1.body.message;
  expect(res1.statusCode).toBe(200);
  expectChatbotIsCalledWith('What is 1 + 1?');
  expect(message).toBeDefined();
});

test('Sending a message with unauthenticated user - should fail', async () => {
  const res1 = await request(server).post('/api/chatbot').set('authorization', 'dummy').send({
    message: 'What is 1 + 1?',
  });
  expect(res1.statusCode).toBe(401);
});

test('Getting message history for a user', async () => {
  const res1 = await request(server).post('/api/chatbot').set('authorization', userToken1).send({
    message: 'What is 2 + 2?',
  });

  const message = res1.body.message;
  expect(res1.statusCode).toBe(200);
  expectChatbotIsCalledWith('What is 2 + 2?');
  expect(message).toBeDefined();

  const res2 = await request(server)
    .get(`/api/chatbot/${userId1}`)
    .set('authorization', userToken1);

  expect(res2.statusCode).toBe(200);
  expect(res2.body.messages.length).toBe(2);
  expect(res2.body.messages).toContainEqual(
    expect.objectContaining({ message: 'What is 2 + 2?', sender: 'user' })
  );
  expect(res2.body.messages).toContainEqual(
    expect.objectContaining({ message, sender: 'ToodlesGPT' })
  );
});

test('Getting message history for a user but unauthenticated - should fail', async () => {
  const res3 = await request(server).get(`/api/chatbot/${userId1}`);
  expect(res3.statusCode).toBe(401);
});

test('Getting message history for a user but userId does not exist - should fail', async () => {
  const res3 = await request(server).get(`/api/chatbot/dummy`).set('authorization', userToken1);
  expect(res3.statusCode).toBe(404);
});

test('deleting chat history for a user', async () => {
  await request(server).post('/api/chatbot').set('authorization', userToken1).send({
    message: 'What is 1 + 1?',
  });

  const res1 = await request(server)
    .delete(`/api/chatbot/${userId1}`)
    .set('authorization', userToken1);

  expect(res1.statusCode).toBe(200);

  const res2 = await request(server)
    .get(`/api/chatbot/${userId1}`)
    .set('authorization', userToken1);

  expect(res2.statusCode).toBe(200);
  expect(res2.body.messages).toStrictEqual([]);
});

test('deleting chat history for a user but unauthenticated - should fail', async () => {
  const res1 = await request(server).delete(`/api/chatbot/${userId1}`);
  expect(res1.statusCode).toBe(401);
});

test('deleting chat history for a user Id does not exist - should fail', async () => {
  const res1 = await request(server).delete(`/api/chatbot/dummy`).set('authorization', userToken1);
  expect(res1.statusCode).toBe(404);
});
