const request = require('supertest');
const WebSocket = require('ws');
const fs = require('fs');
const { server } = require('../server');
const { DB_PATH } = require('../utils/constants');
const FakeTimers = require('@sinonjs/fake-timers');

let educator = {};
let student = {};
let courseId;
let classId;
let clock;

// Helper dates
const now = new Date(2022, 7, 20, 12, 0, 0);
const oneHourAgo = new Date(2022, 7, 20, 11, 0, 0);
const oneHourLater = new Date(2022, 7, 20, 13, 0, 0);
const twoHoursLater = new Date(2022, 7, 20, 14, 0, 0);

// Helpers
async function createClass(token, courseId, className, startTime, endTime, frequency) {
  return await request(server).post('/api/class').set('authorization', token).send({
    courseId,
    className,
    startTime,
    endTime,
    frequency,
  });
}

// Set up users
beforeAll(async () => {
  clock = FakeTimers.install({ now });
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'user1@toodles.com',
    password: 'password',
    firstName: 'Jane',
    lastName: 'Smith',
  });
  educator = res1.body;

  const res2 = await request(server).post('/api/auth/user').send({
    email: 'user2@toodles.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
  });
  student = res2.body;

  await request(server)
    .post('/api/courses')
    .set('authorization', educator.token)
    .send({
      courseName: 'Course 1',
      members: [{ email: 'user2@toodles.com', role: 'Student' }],
    });

  const res3 = await request(server).get('/api/courses').set('authorization', student.token);
  courseId = res3.body[0].courseId;
  clock.uninstall();
});

beforeEach(() => {
  clock = FakeTimers.install({ now });
});

afterEach(() => {
  clock.uninstall();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  await server.close();
});

test('Student cannot create a class', async () => {
  const res1 = await createClass(
    student.token,
    courseId,
    'Class 1',
    oneHourAgo.getTime(),
    oneHourLater.getTime(),
    'once'
  );
  expect(res1.statusCode).toEqual(403);
  const res2 = await request(server)
    .get(`/api/classes/${courseId}`)
    .set('authorization', educator.token);
  expect(res2.body.length).toEqual(0);
});

test('Teachers can create classes', async () => {
  const res1 = await createClass(
    educator.token,
    courseId,
    'Class 1',
    oneHourAgo.getTime(),
    oneHourLater.getTime(),
    'once'
  );
  expect(res1.statusCode).toEqual(200);
  classId = res1.body.classId;

  // Check the class added is correct
  const res2 = await request(server)
    .get(`/api/classes/${courseId}`)
    .set('authorization', educator.token);
  expect(res2.body.length).toEqual(1);
  expect(res2.body[0].classId).toEqual(res1.body.classId);
  expect(res2.body[0].className).toEqual('Class 1');
  expect(res2.body[0].startTime).toEqual(oneHourAgo.getTime());
  expect(res2.body[0].endTime).toEqual(oneHourLater.getTime());
  expect(res2.body[0].frequency).toEqual('once');
});

test('Members can send messages in an active class', (done) => {
  const ws = new WebSocket(
    `ws://${process.env.DOMAIN}:${process.env.SERVER_PORT}/?token=${student.token}&classId=${classId}`
  );

  ws.on('error', () => {
    done();
  });

  ws.on('open', async () => {
    ws.send(JSON.stringify({ type: 'message', classId, text: 'First message' }));
    ws.send(JSON.stringify({ type: 'message', classId, text: 'Second message' }));
  });

  let messageCount = 0;
  ws.on('message', async () => {
    messageCount++;
    if (messageCount < 2) {
      return;
    }
    const res = await request(server)
      .get(`/api/class/${classId}`)
      .set('authorization', student.token);
    expect(res.body.messages.length).toEqual(2);
    expect(res.body.className).toEqual('Class 1');
    expect(res.body.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: student.userId,
          firstName: 'John',
          lastName: 'Doe',
          text: 'First message',
        }),
        expect.objectContaining({
          userId: student.userId,
          firstName: 'John',
          lastName: 'Doe',
          text: 'Second message',
        }),
      ])
    );
    ws.close();
    done();
  });
});

test('Students cannot edit a class', async () => {
  const res1 = await request(server).put('/api/class').set('authorization', student.token).send({
    classId,
    className: 'Class 2',
    startTime: oneHourLater.getTime(),
    endTime: twoHoursLater.getTime(),
    frequency: 'weekly',
  });
  expect(res1.statusCode).toEqual(403);
  const res2 = await request(server)
    .get(`/api/classes/${courseId}`)
    .set('authorization', student.token);
  expect(res2.body.length).toEqual(1);
  expect(res2.body[0].classId).toEqual(classId);
  expect(res2.body[0].className).toEqual('Class 1');
  expect(res2.body[0].startTime).toEqual(oneHourAgo.getTime());
  expect(res2.body[0].endTime).toEqual(oneHourLater.getTime());
  expect(res2.body[0].frequency).toEqual('once');
});

test('Teachers can edit a class', async () => {
  const res1 = await request(server).put('/api/class').set('authorization', educator.token).send({
    classId,
    className: 'Class 2',
    startTime: oneHourLater.getTime(),
    endTime: twoHoursLater.getTime(),
    frequency: 'weekly',
  });
  expect(res1.statusCode).toEqual(200);
  const res2 = await request(server)
    .get(`/api/classes/${courseId}`)
    .set('authorization', educator.token);
  expect(res2.body.length).toEqual(1);
  expect(res2.body[0].classId).toEqual(classId);
  expect(res2.body[0].className).toEqual('Class 2');
  expect(res2.body[0].startTime).toEqual(oneHourLater.getTime());
  expect(res2.body[0].endTime).toEqual(twoHoursLater.getTime());
  expect(res2.body[0].frequency).toEqual('weekly');
});

test("Members cannot join a class that hasn't started", async () => {
  const res1 = await request(server)
    .get(`/api/class/${classId}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(`Class with id ${classId} is not in progress`);
});

test('Weekly classes can be joined a week or two later', async () => {
  const newTime = new Date(oneHourLater);
  newTime.setDate(newTime.getDate() + 7);
  newTime.setMinutes(newTime.getMinutes() - 1);
  clock.setSystemTime(newTime);
  // Log in again and update token
  const res1 = await request(server).post('/api/auth/login').send({
    email: 'user2@toodles.com',
    password: 'password',
  });
  let token = res1.body.token;

  // Check that joining fails 1 minute before the start time
  const res3 = await request(server).get(`/api/class/${classId}`).set('authorization', token);
  expect(res3.statusCode).toEqual(403);

  // Check that at the start time, joining succeeds
  newTime.setMinutes(newTime.getMinutes() + 1);
  clock.setSystemTime(newTime);
  const res4 = await request(server).get(`/api/class/${classId}`).set('authorization', token);
  expect(res4.statusCode).toEqual(200);
  expect(res4.body.className).toEqual('Class 2');

  // Check joining succeeds 2 weeks later
  const res5 = await request(server).post('/api/auth/login').send({
    email: 'user2@toodles.com',
    password: 'password',
  });
  token = res5.body.token;
  newTime.setMinutes(newTime.getDate() + 7);
  clock.setSystemTime(newTime);
  const res6 = await request(server).get(`/api/class/${classId}`).set('authorization', token);
  expect(res6.statusCode).toEqual(200);
  expect(res6.body.className).toEqual('Class 2');
});

test('Students cannot delete a class', async () => {
  const res1 = await request(server)
    .delete(`/api/class/${classId}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(403);
  const res2 = await request(server)
    .get(`/api/classes/${courseId}`)
    .set('authorization', student.token);
  expect(res2.statusCode).toEqual(200);
  expect(res2.body.length).toEqual(1);
});

test('Teachers can delete a class', async () => {
  const res1 = await request(server)
    .delete(`/api/class/${classId}`)
    .set('authorization', educator.token);
  expect(res1.statusCode).toEqual(200);
  const res2 = await request(server)
    .get(`/api/classes/${courseId}`)
    .set('authorization', educator.token);
  expect(res2.statusCode).toEqual(200);
  expect(res2.body.length).toEqual(0);
});

test('Non existent class cannot be deleted', async () => {
  const res1 = await request(server)
    .delete(`/api/class/${classId}`)
    .set('authorization', educator.token);
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Class with id ${classId} not found`);
});

test('Non existent class cannot be edited', async () => {
  const res1 = await request(server).put(`/api/class`).set('authorization', educator.token).send({
    classId,
    className: 'Class 3',
    startTime: oneHourAgo.getTime(),
    endTime: oneHourLater.getTime(),
    frequency: 'fortnightly',
  });
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Class with id ${classId} not found`);
});
