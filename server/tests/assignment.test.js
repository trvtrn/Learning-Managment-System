const request = require('supertest');
const fs = require('fs');
const Database = require('better-sqlite3');
const FakeTimers = require('@sinonjs/fake-timers');
const { server } = require('../server');
const { DB_PATH, FILE_PATH } = require('../utils/constants');
const path = require('path');

let userToken1;
let userToken2;
let userToken3;
let userToken4;
let courseId;
let assignmentId;
const invalidAssignmentId = -1;
const invalidCourseId = -1;
const invalidUserId = -1;
let userId2;
let userId3;

const releaseDate = new Date(2022, 7, 20, 12, 0, 0);
const dueDate = new Date(2022, 7, 25, 12, 0, 0);

let clock;

beforeAll(async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'rjunkparton@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Smith',
  });

  const res2 = await request(server).post('/api/auth/user').send({
    email: 'partonrobertjames@gmail.com',
    password: 'pswd',
    firstName: 'Bob',
    lastName: 'Lee',
  });

  const res3 = await request(server).post('/api/auth/user').send({
    email: 'therobbieparton@gmail.com',
    password: 'xxxx',
    firstName: 'Tim',
    lastName: 'Kim',
  });

  const res4 = await request(server).post('/api/auth/user').send({
    email: 'samantha.woo96@gmail.com',
    password: 'bobby',
    firstName: 'Sam',
    lastName: 'Woo',
  });

  userId2 = res2.body.userId;
  userId3 = res3.body.userId;

  userToken1 = res1.body.token;
  userToken2 = res2.body.token;
  userToken3 = res3.body.token;
  userToken4 = res4.body.token;

  const res5 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [
        { email: 'therobbieparton@gmail.com', role: 'Student' },
        { email: 'partonrobertjames@gmail.com', role: 'Student' },
      ],
    });

  courseId = res5.body.courseId;
});

beforeEach(async () => {
  clock = FakeTimers.install({ now: releaseDate });
  const res = await request(server).post('/api/assignment').set('authorization', userToken1).send({
    courseId,
    assignmentName: 'Assignment 1',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The first assignment on javascript',
    weighting: 20,
  });

  assignmentId = res.body.assignmentId;
});

afterEach(() => {
  clock.uninstall();
  const db = new Database(DB_PATH);
  db.prepare('DELETE FROM assignments').run();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  fs.rmSync(FILE_PATH, { recursive: true, force: true });
  await server.close();
});

test('adding a new assignment as an educator', async () => {
  const res = await request(server).post('/api/assignment').set('authorization', userToken1).send({
    courseId,
    assignmentName: 'Assignment 2',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The second assignment on javascript',
    weighting: 20,
  });

  expect(res.statusCode).toBe(200);
  const newAssignmentId = res.body.assignmentId;

  const res2 = await request(server)
    .get(`/api/assignment/${newAssignmentId}`)
    .set('authorization', userToken1);
  expect(res2.body).toEqual({
    marksReleased: false,
    assignmentName: 'Assignment 2',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The second assignment on javascript',
    files: [],
    weighting: 20,
  });
});

test('adding a new assignment while unauthenticated should fail', async () => {
  const res = await request(server).post('/api/assignment').send({
    courseId,
    assignmentName: 'Assignment 2',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The second assignment on javascript',
    weighting: 20,
  });
  expect(res.statusCode).toBe(401);
});

test('adding a new assignment to a non-existent course should fail', async () => {
  const res = await request(server).post('/api/assignment').set('authorization', userToken1).send({
    courseId: invalidCourseId,
    assignmentName: 'Assignment 2',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The second assignment on javascript',
    weighting: 20,
  });
  expect(res.statusCode).toBe(404);
});

test('adding a new assignment as a non-educator should fail', async () => {
  const res = await request(server).post('/api/assignment').set('authorization', userToken2).send({
    courseId,
    assignmentName: 'Assignment 2',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The second assignment on javascript',
    weighting: 20,
  });
  expect(res.statusCode).toBe(403);
});

test('retrieving an assignment as a member', async () => {
  const res = await request(server)
    .get(`/api/assignment/${assignmentId}`)
    .set('authorization', userToken1);

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    marksReleased: false,
    assignmentName: 'Assignment 1',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The first assignment on javascript',
    files: [],
    weighting: 20,
  });
});

test('retrieving an assignment while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/assignment/${assignmentId}`);
  expect(res.statusCode).toBe(401);
});

test('retrieving a non-existent assignment should fail', async () => {
  const res = await request(server)
    .get(`/api/assignment/${invalidAssignmentId}`)
    .set('authorization', userToken1);

  expect(res.statusCode).toBe(404);
});

test('retrieving an assignment for a non-member should fail', async () => {
  const res = await request(server)
    .get(`/api/assignment/${assignmentId}`)
    .set('authorization', userToken4);

  expect(res.statusCode).toBe(403);
});

test('retrieving all assignments for a course', async () => {
  const res1 = await request(server).post('/api/assignment').set('authorization', userToken1).send({
    courseId,
    assignmentName: 'Assignment 2',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The second assignment on javascript',
    weighting: 20,
  });

  const newAssignmentId = res1.body.assignmentId;

  const res = await request(server)
    .get(`/api/assignment/all/${courseId}`)
    .set('authorization', userToken1);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(2);
  expect(res.body).toContainEqual({
    assignmentId,
    assignmentName: 'Assignment 1',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
  });
  expect(res.body).toContainEqual({
    assignmentId: newAssignmentId,
    assignmentName: 'Assignment 2',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
  });
});

test('retrieving all assignments for a course while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/assignment/all/${courseId}`);
  expect(res.statusCode).toBe(401);
});

test('retrieving all assignments for a non-existent course should fail', async () => {
  const res = await request(server)
    .get(`/api/assignment/all/${invalidCourseId}`)
    .set('authorization', userToken1);

  expect(res.statusCode).toBe(404);
});

test('retrieving all assignments for a course as a student', async () => {
  const res = await request(server)
    .get(`/api/assignment/all/${courseId}`)
    .set('authorization', userToken2);

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([
    {
      assignmentId,
      assignmentName: 'Assignment 1',
      releaseDate: releaseDate.getTime(),
      dueDate: dueDate.getTime(),
    },
  ]);
});

test('updating an assignment while unauthenticated should fail', async () => {
  const updateRes = await request(server).put('/api/assignment').send({
    assignmentId,
    assignmentName: 'Assignment One',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 1000,
    description: 'The updated assignment description',
    weighting: 20,
  });

  expect(updateRes.statusCode).toEqual(401);
});

test('updating a non-existent assignment should fail', async () => {
  const updateRes = await request(server)
    .put('/api/assignment')
    .set('authorization', userToken1)
    .send({
      assignmentId: invalidAssignmentId,
      assignmentName: 'Assignment One',
      releaseDate: releaseDate.getTime(),
      dueDate: dueDate.getTime(),
      totalMarks: 1000,
      description: 'The updated assignment description',
      weighting: 20,
    });

  expect(updateRes.statusCode).toBe(404);
});

test('updating an assignment as a non-educator should fail', async () => {
  const updateRes = await request(server)
    .put('/api/assignment')
    .set('authorization', userToken2)
    .send({
      assignmentId,
      assignmentName: 'Assignment One',
      releaseDate: releaseDate.getTime(),
      dueDate: dueDate.getTime(),
      totalMarks: 1000,
      description: 'The updated assignment description',
      weighting: 20,
    });

  expect(updateRes.statusCode).toBe(403);
});

test('updating an assignment as an educator', async () => {
  const updateRes = await request(server)
    .put('/api/assignment')
    .set('authorization', userToken1)
    .send({
      assignmentId,
      assignmentName: 'Assignment One',
      releaseDate: releaseDate.getTime(),
      dueDate: dueDate.getTime(),
      totalMarks: 1000,
      description: 'The updated assignment description',
      weighting: 20,
    });

  expect(updateRes.statusCode).toBe(200);

  const assignmentRes = await request(server)
    .get(`/api/assignment/${assignmentId}`)
    .set('authorization', userToken1);

  expect(assignmentRes.body).toEqual({
    marksReleased: false,
    assignmentName: 'Assignment One',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 1000,
    description: 'The updated assignment description',
    files: [],
    weighting: 20,
  });
});

test('submitting an assignment as a student', async () => {
  // Submitting after the deadline should fail
  clock.uninstall();
  clock = FakeTimers.install({ now: releaseDate.getTime(), shouldAdvanceTime: true });
  const submission1 = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .field('assignmentId', assignmentId)
    .attach('files', path.resolve(__dirname, './files/dog.jpeg'));

  expect(submission1.statusCode).toBe(200);
  const submissionId = submission1.body.submissionId;

  const res1 = await request(server)
    .get(`/api/assignment/${assignmentId}/submission/${userId3}`)
    .set('authorization', userToken3);
  expect(res1.body).toEqual({
    submissionId,
    mark: null,
    totalMarks: 100,
    comment: null,
    files: [expect.objectContaining({ fileName: 'dog.jpeg' })],
  });

  // Submitting after the deadline should fail
  clock.setSystemTime(dueDate.getTime() + 1);

  const submission2 = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .field('assignmentId', assignmentId)
    .attach('files', path.resolve(__dirname, './files/pdf.pdf'));

  expect(submission2.statusCode).toBe(403);

  const res2 = await request(server)
    .get(`/api/assignment/${assignmentId}/submission/${userId3}`)
    .set('authorization', userToken3);
  expect(res2.body).toEqual({
    submissionId,
    mark: null,
    totalMarks: 100,
    comment: null,
    files: [expect.objectContaining({ fileName: 'dog.jpeg' })],
  });
});

test('submitting an assignment as a non-member should fail', async () => {
  const submission = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken4)
    .send({
      assignmentId,
    });

  expect(submission.statusCode).toBe(403);
});

test('submitting multiple times does not create a new submission', async () => {
  const res1 = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .send({
      assignmentId,
    });

  expect(res1.statusCode).toBe(200);
  const submissionId1 = res1.body.submissionId;

  const res2 = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .send({
      assignmentId,
    });

  expect(res2.statusCode).toBe(200);
  const submissionId2 = res2.body.submissionId;

  expect(submissionId1).toBeDefined();
  expect(submissionId1).toEqual(submissionId2);
});

test('submitting an assignment while unauthenticated should fail', async () => {
  const submissionRes = await request(server).put('/api/assignment/submission').send({
    assignmentId,
  });

  expect(submissionRes.statusCode).toEqual(401);
});

test('submitting to a non-existent assignment should fail', async () => {
  const submissionRes = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .send({
      assignmentId: invalidAssignmentId,
    });

  expect(submissionRes.statusCode).toBe(404);
});

test('getting an assignment submission as the submitter', async () => {
  const submissionRes = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .send({
      assignmentId,
    });

  const submissionId = submissionRes.body.submissionId;

  const getSubmissionRes = await request(server)
    .get(`/api/assignment/${assignmentId}/submission/${userId3}`)
    .set('authorization', userToken1);

  expect(getSubmissionRes.statusCode).toBe(200);
  expect(getSubmissionRes.body).toEqual({
    mark: null,
    submissionId,
    comment: null,
    totalMarks: 100,
    files: [],
  });
});

test('get an assignment submission for a non-existent student should fail', async () => {
  const getSubmissionRes = await request(server)
    .get(`/api/assignment/${assignmentId}/submission/${invalidUserId}`)
    .set('authorization', userToken1);

  expect(getSubmissionRes.statusCode).toBe(404);
});

test('get an assignment submission while unauthenticated should fail', async () => {
  const getSubmissionRes = await request(server).get(
    `/api/assignment/${assignmentId}/submission/${userId3}`
  );

  expect(getSubmissionRes.statusCode).toEqual(401);
});

test('get a submission for a non-existent assignment should fail', async () => {
  const getSubmissionRes = await request(server)
    .get(`/api/assignment/${invalidAssignmentId}/submission/${userId3}`)
    .set('authorization', userToken1);

  expect(getSubmissionRes.statusCode).toBe(404);
});

test('get a submission as a non-educator and non-submitter should fail', async () => {
  const getSubmissionRes = await request(server)
    .get(`/api/assignment/${assignmentId}/submission/${userId3}`)
    .set('authorization', userToken2);

  expect(getSubmissionRes.statusCode).toBe(403);
});

test('get a non-submitted assignment as an educator', async () => {
  const getSubmissionRes = await request(server)
    .get(`/api/assignment/${assignmentId}/submission/${userId2}`)
    .set('authorization', userToken1);

  expect(getSubmissionRes.statusCode).toBe(404);
});

test('marking an assignment while unauthenticated should fail', async () => {
  const markRes = await request(server).put('/api/assignment/mark').send({
    submissionId: 1,
    mark: 100,
    comment: 'A great assignment. Well done.',
  });

  expect(markRes.statusCode).toEqual(401);
});

test('marking a non-existent assignment should fail', async () => {
  const markRes = await request(server)
    .put('/api/assignment/mark')
    .set('authorization', userToken1)
    .send({
      submissionId: -1,
      mark: 100,
      comment: 'A great assignment. Well done.',
    });

  expect(markRes.statusCode).toBe(404);
});

test('marking an assignment as a non-educator should fail', async () => {
  const submission = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .send({
      assignmentId,
    });

  const submissionId = submission.body.submissionId;

  const markRes = await request(server)
    .put('/api/assignment/mark')
    .set('authorization', userToken3)
    .send({
      submissionId: submissionId,
      mark: 100,
      comment: 'A great assignment. Well done.',
    });

  expect(markRes.statusCode).toBe(403);
});

test('marking an assignment as an educator', async () => {
  const submission = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .send({
      assignmentId,
    });

  const submissionId = submission.body.submissionId;
  expect(submission.statusCode).toBe(200);

  const markRes = await request(server)
    .put('/api/assignment/mark')
    .set('authorization', userToken1)
    .send({
      submissionId,
      mark: 100,
      comment: 'A great assignment. Well done.',
    });

  expect(markRes.statusCode).toBe(200);

  const getSubmissionRes = await request(server)
    .get(`/api/assignment/${assignmentId}/submission/${userId3}`)
    .set('authorization', userToken1);

  expect(getSubmissionRes.body).toEqual({
    submissionId,
    mark: 100,
    totalMarks: 100,
    comment: 'A great assignment. Well done.',
    files: [],
  });
});

test('releasing marks for an assignment as an educator', async () => {
  const releaseMarksRes = await request(server)
    .put('/api/assignment/release')
    .set('authorization', userToken1)
    .send({
      assignmentId,
      releaseMarks: true,
    });

  expect(releaseMarksRes.statusCode).toBe(200);

  const res2 = await request(server)
    .get(`/api/assignment/${assignmentId}`)
    .set('authorization', userToken1);

  expect(res2.body).toEqual({
    marksReleased: true,
    assignmentName: 'Assignment 1',
    releaseDate: releaseDate.getTime(),
    dueDate: dueDate.getTime(),
    totalMarks: 100,
    description: 'The first assignment on javascript',
    files: [],
    weighting: 20,
  });
});

test('Un-releasing marks for an assignment as an educator', async () => {
  const releaseMarksRes = await request(server)
    .put('/api/assignment/release')
    .set('authorization', userToken1)
    .send({
      assignmentId,
      releaseMarks: false,
    });

  expect(releaseMarksRes.statusCode).toBe(200);
});

test('releasing marks for an assignment while unauthenticated should fail', async () => {
  const releaseMarksRes = await request(server).put('/api/assignment/release').send({
    assignmentId,
    releaseMarks: true,
  });

  expect(releaseMarksRes.statusCode).toEqual(401);
});

test('releasing marks for a non-existent assignment should fail', async () => {
  const releaseMarksRes = await request(server)
    .put('/api/assignment/release')
    .set('authorization', userToken1)
    .send({
      assignmentId: invalidAssignmentId,
      releaseMarks: true,
    });

  expect(releaseMarksRes.statusCode).toBe(404);
});

test('releasing marks for an assignment as a non-educator educator should fail', async () => {
  const releaseMarksRes = await request(server)
    .put('/api/assignment/release')
    .set('authorization', userToken3)
    .send({
      assignmentId,
      releaseMarks: true,
    });

  expect(releaseMarksRes.statusCode).toBe(403);
});

test('getting all submissions for an assignment while unauthenticated should fail', async () => {
  const assignmentsRes = await request(server).get(`/api/assignment/submissions/${assignmentId}`);
  expect(assignmentsRes.statusCode).toEqual(401);
});

test('getting all submissions for a non-existent assignment should fail', async () => {
  const assignmentsRes = await request(server)
    .get(`/api/assignment/submissions/${invalidAssignmentId}`)
    .set('authorization', userToken1);

  expect(assignmentsRes.statusCode).toBe(404);
});

test('getting all submissions for an assignment as a non-educator should fail', async () => {
  const assignmentsRes = await request(server)
    .get(`/api/assignment/submissions/${assignmentId}`)
    .set('authorization', userToken3);

  expect(assignmentsRes.statusCode).toBe(403);
});

test('getting all submissions for an assignment as an educator', async () => {
  const res1 = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken2)
    .send({
      assignmentId,
    });

  const res2 = await request(server)
    .put('/api/assignment/submission')
    .set('authorization', userToken3)
    .send({
      assignmentId,
    });

  const submissionId1 = res1.body.submissionId;
  const submissionId2 = res2.body.submissionId;

  await request(server).put('/api/assignment/mark').set('authorization', userToken1).send({
    submissionId: submissionId1,
    mark: 85,
    comment: 'Nice work!',
  });

  const res3 = await request(server)
    .get(`/api/assignment/submissions/${assignmentId}`)
    .set('authorization', userToken1);

  expect(res3.statusCode).toBe(200);
  expect(res3.body.length).toBe(2);
  expect(res3.body).toContainEqual({
    submissionId: submissionId1,
    comment: 'Nice work!',
    mark: 85,
    studentName: 'Bob Lee',
    email: 'partonrobertjames@gmail.com',
    markerName: 'John Smith',
    fileId: null,
    fileName: null,
  });
  expect(res3.body).toContainEqual({
    submissionId: submissionId2,
    comment: null,
    mark: null,
    fileId: null,
    fileName: null,
    studentName: 'Tim Kim',
    email: 'therobbieparton@gmail.com',
    markerName: null,
  });
});

test('deleting an assignment while unauthenticated should fail', async () => {
  const res = await request(server).delete(`/api/assignment/${assignmentId}`);
  expect(res.statusCode).toBe(401);
});

test('deleting an assignment as an educator', async () => {
  const res1 = await request(server)
    .delete(`/api/assignment/${assignmentId}`)
    .set('authorization', userToken1);

  expect(res1.statusCode).toBe(200);

  const res2 = await request(server)
    .get(`/api/assignment/${assignmentId}`)
    .set('authorization', userToken1);
  expect(res2.statusCode).toBe(404);
});

test('deleting an assignment as non-educator should fail', async () => {
  const deleteRes = await request(server)
    .delete(`/api/assignment/${assignmentId}`)
    .set('authorization', userToken3);
  expect(deleteRes.statusCode).toBe(403);
});

test('deleting a non-existent assignment should fail', async () => {
  const deleteRes = await request(server)
    .delete(`/api/assignment/${invalidAssignmentId}`)
    .set('authorization', userToken1);
  expect(deleteRes.statusCode).toBe(404);
});
