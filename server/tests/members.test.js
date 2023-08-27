const request = require('supertest');
const fs = require('fs');
const { server } = require('../server');
const { DB_PATH } = require('../utils/constants');
const { db } = require('../scripts/database');

let userToken1;
let userToken2;
let userToken3;
let userId1;
let userId2;
let userId3;
let courseId;

beforeAll(async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'js@toodles.com',
    password: 'xxxx',
    firstName: 'John',
    lastName: 'Smith',
  });

  const res2 = await request(server).post('/api/auth/user').send({
    email: 'bl@toodles.com',
    password: 'xxxx',
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
  userId1 = res1.body.userId;
  userId2 = res2.body.userId;
  userId3 = res3.body.userId;
});

beforeEach(async () => {
  const res = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [{ email: 'bl@toodles.com', role: 'Student' }],
    });

  courseId = res.body.courseId;
});

afterEach(() => {
  db.prepare('DELETE FROM enrollments').run();
  db.prepare('DELETE FROM courses').run();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  await server.close();
});

test('Getting members of course while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/members/${courseId}`);
  expect(res.statusCode).toBe(401);
});

test('Getting members of course while not enrolled should fail', async () => {
  const res = await request(server)
    .get(`/api/members/${courseId}`)
    .set('authorization', userToken3);
  expect(res.statusCode).toBe(403);
});

test('Getting members of non-existent course should fail', async () => {
  const res = await request(server).get('/api/members/123').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting members of an existing course as a member', async () => {
  const res = await request(server)
    .get(`/api/members/${courseId}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(2);
  expect(res.body).toContainEqual({
    userId: userId1,
    email: 'js@toodles.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Creator',
  });
  expect(res.body).toContainEqual({
    userId: userId2,
    email: 'bl@toodles.com',
    firstName: 'Bob',
    lastName: 'Lee',
    role: 'Student',
  });
});

test('Adding members while unauthenticated should fail', async () => {
  const res = await request(server).post('/api/members').send({
    courseId,
    members: [],
  });

  expect(res.statusCode).toBe(401);
});

test('Adding members to a non-existent course should fail', async () => {
  const res = await request(server).post('/api/members').set('authorization', userToken1).send({
    courseId: 2000,
    members: [],
  });

  expect(res.statusCode).toBe(404);
});

test('Adding non-existent member to course should fail', async () => {
  const res = await request(server)
    .post('/api/members')
    .set('authorization', userToken1)
    .send({
      courseId,
      members: [
        { email: 'nope@nope.com', role: 'Student' },
        { userId: userId3, role: 'Student' },
      ],
    });

  expect(res.statusCode).toBe(404);
});

test('Adding members as a non-educator should fail', async () => {
  const res = await request(server).post('/api/members').set('authorization', userToken2).send({
    courseId,
    members: [],
  });

  expect(res.statusCode).toBe(403);
});

test('Adding members as an educator of the course', async () => {
  const res1 = await request(server)
    .post('/api/members')
    .set('authorization', userToken1)
    .send({
      courseId,
      members: [{ email: 'tk@toodles.com', role: 'Student' }],
    });

  expect(res1.statusCode).toBe(200);

  const res2 = await request(server)
    .get(`/api/members/${courseId}`)
    .set('authorization', userToken1);
  expect(res2.body).toHaveLength(3);
  const userIds = res2.body.map((user) => user.userId);
  expect(userIds).toContainEqual(userId1);
  expect(userIds).toContainEqual(userId2);
  expect(userIds).toContainEqual(userId3);
});

test('Adding already enrolled members does not enrol them twice', async () => {
  const res1 = await request(server)
    .post('/api/members')
    .set('authorization', userToken1)
    .send({
      courseId,
      members: [{ email: 'bl@toodles.com', role: 'Educator' }],
    });

  expect(res1.statusCode).toBe(200);

  const res2 = await request(server)
    .get(`/api/members/${courseId}`)
    .set('authorization', userToken1);
  expect(res2.body).toHaveLength(2);
  expect(res2.body).toContainEqual({
    userId: userId2,
    email: 'bl@toodles.com',
    firstName: 'Bob',
    lastName: 'Lee',
    role: 'Student',
  });
  expect(res2.body).toContainEqual({
    userId: userId1,
    email: 'js@toodles.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'Creator',
  });
});

test('Deleting a course member while unauthenticated should fail', async () => {
  const res = await request(server).delete(`/api/member/${courseId}/${userId2}`);
  expect(res.statusCode).toBe(401);
});

test('Deleting a member from a non-existent course should fail', async () => {
  const res = await request(server)
    .delete(`/api/member/2000/${userId2}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Deleting a non-existent member from a course should fail', async () => {
  const res = await request(server)
    .delete(`/api/member/${courseId}/2000`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Deleting a non-member from a course should fail', async () => {
  const res = await request(server)
    .delete(`/api/member/${courseId}/${userId3}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Deleting a member as a non-educator should fail', async () => {
  const res = await request(server)
    .delete(`/api/member/${courseId}/${userId1}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Deleting a member as an educator', async () => {
  const res1 = await request(server)
    .delete(`/api/member/${courseId}/${userId2}`)
    .set('authorization', userToken1);
  expect(res1.statusCode).toBe(200);

  const res2 = await request(server)
    .get(`/api/members/${courseId}`)
    .set('authorization', userToken1);
  expect(res2.body).toHaveLength(1);
  expect(res2.body[0].userId).toEqual(userId1);
});

test('Getting role while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/member/${courseId}`);
  expect(res.statusCode).toBe(401);
});

test('Getting role in non-existent course should fail', async () => {
  const res = await request(server).get('/api/member/1000').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting role in a course while not enrolled should fail', async () => {
  const res = await request(server).get(`/api/member/${courseId}`).set('authorization', userToken3);
  expect(res.statusCode).toBe(403);
});

test('Getting role in course as a member', async () => {
  const res = await request(server).get(`/api/member/${courseId}`).set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body.role).toBe('Student');
});

test('Updating role of a user while unauthenticated should fail', async () => {
  const res = await request(server).put('/api/member').send({
    courseId,
    userId: userId2,
    role: 'Educator',
  });

  expect(res.statusCode).toBe(401);
});

test('Updating role of user in non-existent course should fail', async () => {
  const res = await request(server).put('/api/member').set('authorization', userToken1).send({
    courseId: 2000,
    userId: userId3,
    role: 'Student',
  });

  expect(res.statusCode).toBe(404);
});

test('Updating role of non-existent user course should fail', async () => {
  const res = await request(server).put('/api/member').set('authorization', userToken1).send({
    courseId,
    userId: 2000,
    role: 'Student',
  });

  expect(res.statusCode).toBe(404);
});

test('Updating role of user as a non-educator should fail', async () => {
  const res = await request(server).put('/api/member').set('authorization', userToken2).send({
    courseId,
    userId: userId1,
    role: 'Student',
  });

  expect(res.statusCode).toBe(403);
});

test('Updating role of user not part of course should fail', async () => {
  const res = await request(server).put('/api/member').set('authorization', userToken1).send({
    courseId,
    userId: userId3,
    role: 'Student',
  });

  expect(res.statusCode).toBe(404);
});

test('Educators cannot update roles', async () => {
  const res1 = await request(server)
    .get(`/api/member/${courseId}/${userId2}`)
    .set('authorization', userToken2);
  expect(res1.body.role).toBe('Student');

  const res2 = await request(server).put('/api/member').set('authorization', userToken1).send({
    courseId,
    userId: userId2,
    role: 'Educator',
  });

  expect(res2.statusCode).toBe(200);

  const res3 = await request(server)
    .get(`/api/member/${courseId}/${userId2}`)
    .set('authorization', userToken2);
  expect(res3.body.role).toBe('Educator');

  const res4 = await request(server).put('/api/member').set('authorization', userToken2).send({
    courseId,
    userId: userId1,
    role: 'Student',
  });

  expect(res4.statusCode).toBe(403);
});

test('A user can delete themselves from a course', async () => {
  const res1 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [{ email: 'bl@toodles.com', role: 'Student' }],
    });
  expect(res1.statusCode).toBe(200);

  const courseId = res1.body.courseId;

  const res2 = await request(server)
    .delete(`/api/member/${courseId}/${userId2}`)
    .set('authorization', userToken2);
  expect(res2.statusCode).toBe(200);

  const res3 = await request(server)
    .get(`/api/members/${courseId}`)
    .set('authorization', userToken1);
  expect(res3.body.length).toEqual(1);
  expect(res3.body).toEqual([
    {
      userId: userId1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'js@toodles.com',
      role: 'Creator',
    },
  ]);
});

test('A creator cannot be deleted from the course', async () => {
  const res1 = await request(server).post('/api/courses').set('authorization', userToken1).send({
    courseName: 'COMP3900',
    members: [],
  });
  expect(res1.statusCode).toBe(200);

  const courseId = res1.body.courseId;

  const res2 = await request(server)
    .delete(`/api/member/${courseId}/${userId1}`)
    .set('authorization', userToken1);
  expect(res2.statusCode).toBe(403);

  const res3 = await request(server)
    .get(`/api/members/${courseId}`)
    .set('authorization', userToken1);
  expect(res3.statusCode).toBe(200);
  expect(res3.body.length).toEqual(1);
  expect(res3.body).toEqual([
    {
      userId: userId1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'js@toodles.com',
      role: 'Creator',
    },
  ]);
});
