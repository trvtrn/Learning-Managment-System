const request = require('supertest');
const fs = require('fs');
const path = require('path');
const FakeTimers = require('@sinonjs/fake-timers');
const { server } = require('../server');
const { DB_PATH, FILE_PATH } = require('../utils/constants');
const { sendMailMock } = require('./mocks.js');

jest.mock('nodemailer');

let userToken1;
let userToken2;
let userToken3;
let courseId;
let materialId;
let clock;

const now = new Date(2022, 7, 20, 12, 0, 0);

beforeAll(async () => {
  clock = FakeTimers.install({ now });
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'js@toodles.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  const res2 = await request(server).post('/api/auth/user').send({
    email: 'bl@toodles.com',
    password: 'pswd',
    firstName: 'Bob',
    lastName: 'Lee',
  });

  const res3 = await request(server).post('/api/auth/user').send({
    email: 'tk@toodles.com',
    password: 'xxxx',
    firstName: 'Tim',
    lastName: 'Kim',
  });

  userToken1 = res1.body.token;
  userToken2 = res2.body.token;
  userToken3 = res3.body.token;

  const res4 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [{ email: 'tk@toodles.com', role: 'Student' }],
    });

  courseId = res4.body.courseId;

  const res5 = await request(server).post('/api/material').set('authorization', userToken1).send({
    courseId,
    materialName: 'Assignment 1',
    description: 'The first assignment',
  });

  materialId = res5.body.materialId;
  clock.uninstall();
});

beforeEach(() => {
  clock = FakeTimers.install({ now });
});

afterEach(() => {
  clock.uninstall();
  jest.clearAllMocks();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  fs.rmSync(FILE_PATH, { recursive: true, force: true });
  await server.close();
});

test('retrieving teaching materials from non-existent course', async () => {
  const res = await request(server).get('/api/materials/12345').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('retrieving teaching materials for a course while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/materials/${courseId}`);
  expect(res.statusCode).toBe(401);
});

test('retrieving teaching materials for a course without being enrolled should fail', async () => {
  const res = await request(server)
    .get(`/api/materials/${courseId}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('retrieving teaching materials from existing course as a member', async () => {
  const res = await request(server)
    .get(`/api/materials/${courseId}`)
    .set('authorization', userToken3);
  expect(res.body).toEqual([
    {
      materialId,
      materialName: 'Assignment 1',
      description: 'The first assignment',
      timeCreated: now.getTime(),
    },
  ]);
});

test('retrieving a material while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/material/${materialId}`);
  expect(res.statusCode).toBe(401);
});

test('retrieving a non-existent teaching material', async () => {
  const res = await request(server).get('/api/material/999').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('retrieving a teaching material as someone not in the course should fail', async () => {
  const res = await request(server)
    .get(`/api/material/${materialId}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('retrieving existing teaching material as a student of the course', async () => {
  const res = await request(server)
    .get(`/api/material/${materialId}`)
    .set('authorization', userToken3);
  expect(res.body.materialName).toEqual('Assignment 1');
  expect(res.body.description).toEqual('The first assignment');
  expect(res.body.files).toEqual([]);
});

test('adding teaching material to a non-existent course should fail', async () => {
  const res = await request(server).post('/api/material').set('authorization', userToken1).send({
    courseId: 2000,
    materialName: 'Nope',
    description: 'Nothing',
  });

  expect(res.statusCode).toBe(404);
});

test('adding teaching material while unauthenticated should fail', async () => {
  const res = await request(server).post('/api/material').send({
    courseId,
    materialName: 'Nope',
    description: 'Nothing',
  });

  expect(res.statusCode).toBe(401);
});

test('adding teaching material as a non-educator should fail', async () => {
  const res = await request(server).post('/api/material').set('authorization', userToken3).send({
    courseId,
    materialName: 'Nope',
    description: 'Nothing',
  });

  expect(res.statusCode).toBe(403);
});

test('deleting non-existent material should fail', async () => {
  const res = await request(server).delete('/api/material/123').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('deleting material while unauthenticated should fail', async () => {
  const res = await request(server).delete(`/api/material/${materialId}`);
  expect(res.statusCode).toBe(401);
});

test('deleting material as a non-educator should fail', async () => {
  const res = await request(server)
    .delete(`/api/material/${materialId}`)
    .set('authorization', userToken3);
  expect(res.statusCode).toBe(403);
});

test('retrieving deleted material should fail', async () => {
  const res1 = await request(server).post('/api/material').set('authorization', userToken1).send({
    courseId,
    materialName: 'Assignment 200',
    description: 'The 200th assignment',
  });

  const newMaterialId = res1.body.materialId;
  await request(server).delete(`/api/material/${newMaterialId}`).set('authorization', userToken1);
  const res2 = await request(server)
    .get(`/api/material/${newMaterialId}`)
    .set('authorization', userToken1);
  expect(res2.statusCode).toBe(404);
});

test('updating material while unauthenticated should fail', async () => {
  const res = await request(server).put('/api/material').send({
    materialId,
    materialName: 'no',
    description: 'nope',
  });

  expect(res.statusCode).toBe(401);
});

test('updating non-existent teaching material should fail', async () => {
  const res = await request(server).put('/api/material').set('authorization', userToken1).send({
    materialId: 9999,
    materialName: 'no',
    description: 'nope',
  });

  expect(res.statusCode).toBe(404);
});

test('updating existing teaching material as non-educator should fail', async () => {
  const res = await request(server).put('/api/material').set('authorization', userToken3).send({
    materialId,
    materialName: 'no',
    description: 'nope',
  });

  expect(res.statusCode).toBe(403);
});

test('updating and retrieving teaching material as educator with attached files', async () => {
  clock.uninstall();
  // Test will hang if system time does not advance due to problems with multer
  clock = FakeTimers.install({
    now,
    shouldAdvanceTime: true,
  });
  const res1 = await request(server)
    .put('/api/material')
    .set('authorization', userToken1)
    .field('materialId', materialId)
    .field('materialName', 'Test 1')
    .field('description', 'The first test')
    .attach('files', path.resolve(__dirname, './files/dog.jpeg'))
    .attach('files', path.resolve(__dirname, './files/pdf.pdf'));
  expect(res1.statusCode).toBe(200);
  expect(sendMailMock).toHaveBeenCalledTimes(0);

  const res2 = await request(server)
    .get(`/api/material/${materialId}`)
    .set('authorization', userToken3);
  expect(res2.body.materialName).toEqual('Test 1');
  expect(res2.body.description).toEqual('The first test');
  expect(res2.body.files).toEqual([
    expect.objectContaining({ fileName: 'dog.jpeg' }),
    expect.objectContaining({ fileName: 'pdf.pdf' }),
  ]);
});

test('Updating material with shouldNotifyStudents set to true should call sendMail once for everyone in the course', async () => {
  const res1 = await request(server).put('/api/material').set('authorization', userToken1).send({
    materialId,
    materialName: 'Test 2',
    description: 'The first test',
    shouldNotifyStudents: true,
  });
  expect(res1.statusCode).toEqual(200);
  expect(sendMailMock).toHaveBeenCalledTimes(2);
  expect([sendMailMock.mock.calls[0][0], sendMailMock.mock.calls[1][0]]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ to: 'tk@toodles.com' }),
      expect.objectContaining({ to: 'js@toodles.com' }),
    ])
  );
});

test('Posting a material with shouldNotifyStudents set to true should call sendMail once for everyone in the course', async () => {
  const res1 = await request(server).post('/api/material').set('authorization', userToken1).send({
    courseId,
    materialName: 'Another test',
    description: 'Just another test',
    shouldNotifyStudents: true,
  });
  expect(res1.statusCode).toEqual(200);
  expect(sendMailMock).toHaveBeenCalledTimes(2);
  expect([sendMailMock.mock.calls[0][0], sendMailMock.mock.calls[1][0]]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ to: 'tk@toodles.com' }),
      expect.objectContaining({ to: 'js@toodles.com' }),
    ])
  );
});
