const request = require('supertest');
const fs = require('fs');
const { server } = require('../server');
const { DB_PATH } = require('../utils/constants');
const { db } = require('../scripts/database');

let userToken1;
let userToken2;

beforeAll(async () => {
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

  userToken1 = res1.body.token;
  userToken2 = res2.body.token;
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  await server.close();
});

afterEach(() => {
  db.prepare('DELETE FROM enrollments').run();
  db.prepare('DELETE FROM courses').run();
});

test('Adding a course with no members auto-enrols course creator as educator', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP3900',
    members: [],
  });
  const courseId = res1.body.courseId;
  expect(res1.statusCode).toBe(200);
  expect(courseId).toBeDefined();

  const res2 = await request(server).get(`/api/courses`).set('authorization', userToken1);
  expect(res2.body).toEqual([
    { courseId, courseName: 'COMP3900', firstName: 'John', lastName: 'Smith' },
  ]);
});

test('Adding a course with a non-existent member should fail', async () => {
  const res = await request(server)
    .post(`/api/courses`)
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [
        { email: 'bl@toodles.com', role: 'Student' },
        { email: 'noone@nope.com', role: 'Student' },
      ],
    });
  expect(res.statusCode).toBe(404);
});

test('Adding members to courses and retrieving all courses for a member', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP1511',
    members: [],
  });
  const courseId1 = res1.body.courseId;

  const res2 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP2521',
    members: [],
  });
  const courseId2 = res2.body.courseId;

  const res3 = await request(server).get('/api/courses').set('authorization', userToken1);
  expect(res3.body).toHaveLength(2);
  expect(res3.body).toContainEqual({
    courseId: courseId1,
    courseName: 'COMP1511',
    firstName: 'John',
    lastName: 'Smith',
  });
  expect(res3.body).toContainEqual({
    courseId: courseId2,
    courseName: 'COMP2521',
    firstName: 'John',
    lastName: 'Smith',
  });
});

test('Editing a course name unauthenticated should fail', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP1511',
    members: [],
  });
  const courseId = res1.body.courseId;
  const res2 = await request(server)
    .put(`/api/courses/${courseId}`)
    .send({ courseName: 'new name' });
  expect(res2.statusCode).toEqual(401);
  const res3 = await request(server)
    .get(`/api/courses/${courseId}`)
    .set('authorization', userToken1);
  expect(res3.body.courseName).toEqual('COMP1511');
});

test('Editing a course name as a non-creator should fail', async () => {
  const res1 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP1511',
      members: [{ email: 'bl@toodles.com', role: 'Educator' }],
    });
  const courseId = res1.body.courseId;
  const res2 = await request(server)
    .put(`/api/courses/${courseId}`)
    .set('authorization', userToken2)
    .send({ courseName: 'new name' });
  expect(res2.statusCode).toEqual(403);
  const res3 = await request(server)
    .get(`/api/courses/${courseId}`)
    .set('authorization', userToken1);
  expect(res3.body.courseName).toEqual('COMP1511');
});

test('Editing a course name as a creator', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP1511',
    members: [],
  });
  const courseId = res1.body.courseId;
  const res2 = await request(server)
    .put(`/api/courses/${courseId}`)
    .set('authorization', userToken1)
    .send({ courseName: 'new name' });
  expect(res2.statusCode).toEqual(200);
  const res3 = await request(server)
    .get(`/api/courses/${courseId}`)
    .set('authorization', userToken1);
  expect(res3.body.courseName).toEqual('new name');
});

test('Deleting a non-existent course should fail', async () => {
  const res = await request(server).delete('/api/courses').set('authorization', userToken1).send({
    courseId: 123,
  });
  expect(res.statusCode).toBe(404);
});

test('Deleting a course as someone who is not the creator should fail', async () => {
  const res1 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [{ email: 'bl@toodles.com', role: 'Educator' }],
    });
  const courseId = res1.body.courseId;

  const res2 = await request(server)
    .delete(`/api/courses/${courseId}`)
    .set('authorization', userToken2);
  expect(res2.statusCode).toBe(403);
});

test('Deleting a course that a user is enrolled in', async () => {
  const res1 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [{ email: 'bl@toodles.com', role: 'Student' }],
    });
  const courseId = res1.body.courseId;

  const res2 = await request(server).get('/api/courses').set('authorization', userToken2);
  expect(res2.body).toEqual([
    {
      courseId,
      courseName: 'COMP3900',
      firstName: 'John',
      lastName: 'Smith',
    },
  ]);

  const res3 = await request(server)
    .delete(`/api/courses/${courseId}`)
    .set('authorization', userToken1);
  expect(res3.statusCode).toBe(200);

  const res4 = await request(server).get('/api/courses').set('authorization', userToken2);
  expect(res4.body).toEqual([]);
});

test('Getting the course name and creators name using /api/courses/:courseId endpoint', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP3900',
    members: [],
  });
  const courseId = res1.body.courseId;
  expect(res1.statusCode).toBe(200);
  expect(courseId).toBeDefined();

  const res2 = await request(server)
    .get(`/api/courses/${courseId}`)
    .set('authorization', userToken1);
  expect(res2.body).toStrictEqual({ courseName: 'COMP3900', firstName: 'John', lastName: 'Smith' });
});

test('Getting the course name and creators name using /api/courses/:courseId endpoint but unauthenticated user - should fail', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP3900',
    members: [],
  });
  const courseId = res1.body.courseId;
  expect(res1.statusCode).toBe(200);
  expect(courseId).toBeDefined();

  const res2 = await request(server).get(`/api/courses/${courseId}`);
  expect(res2.statusCode).toBe(401);
});

test('Getting the course name and creators name using /api/courses/:courseId endpoint with invalid course ID - should fail', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP3900',
    members: [],
  });
  const courseId = res1.body.courseId;
  expect(res1.statusCode).toBe(200);
  expect(courseId).toBeDefined();

  const invalidCourseId = -1;

  const res2 = await request(server)
    .get(`/api/courses/${invalidCourseId}`)
    .set('authorization', userToken1);

  expect(res2.statusCode).toBe(404);
});
