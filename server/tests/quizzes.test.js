const request = require('supertest');
const fs = require('fs');
const { server } = require('../server');
const {
  DB_PATH,
  QUIZ_SUBMISSION_BUFFER,
  QUIZ_ANSWERS_RELEASE_BUFFER,
} = require('../utils/constants');
const { db } = require('../scripts/database');
const FakeTimers = require('@sinonjs/fake-timers');

let userToken1;
let userToken2;
let userToken3;
let userId1;
let userId2;
let courseId;
let clock;

// date helpers
const now = new Date(2022, 7, 20, 12, 0, 0);
const tomorrow = new Date(2022, 7, 21, 12, 0, 0);
const yesterday = new Date(2022, 7, 19, 12, 0, 0);
const deadline = new Date(2022, 7, 22, 12, 0, 0);

async function createQuiz(duration = 60, releaseDate = now, dueDate = deadline) {
  const res = await request(server)
    .post('/api/quiz')
    .set('authorization', userToken1)
    .send({
      courseId,
      name: 'Quiz',
      description: 'a quiz',
      releaseDate: releaseDate.getTime(),
      dueDate: dueDate.getTime(),
      duration,
      weighting: 10,
      questions: [
        {
          questionType: 'Short Answer',
          questionText: 'a short answer q',
          maximumMark: 3,
        },
        {
          questionType: 'Multiple Choice',
          questionText: 'a mcq',
          maximumMark: 1,
          options: [
            { optionText: 'option 1', isAnswer: false },
            { optionText: 'option 2', isAnswer: true },
            { optionText: 'option 3', isAnswer: true },
            { optionText: 'option 4', isAnswer: false },
          ],
        },
      ],
    });

  return res.body.quizId;
}

beforeAll(async () => {
  clock = FakeTimers.install({ now });
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

  const res4 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [{ email: 'bl@toodles.com', role: 'Student' }],
    });

  courseId = res4.body.courseId;
  clock.uninstall();
});

beforeEach(() => {
  clock = FakeTimers.install({ now });
});

afterEach(() => {
  clock.uninstall();
  db.prepare('DELETE FROM quizzes').run();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  await server.close();
});

test('Getting all quizzes of a course while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/quizzes/${courseId}`);
  expect(res.statusCode).toBe(401);
});

test('Getting all quizzes of a non-existent course should fail', async () => {
  const res = await request(server).get('/api/quizzes/2000').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting all quizzes of a course while not enrolled should fail', async () => {
  const res = await request(server)
    .get(`/api/quizzes/${courseId}`)
    .set('authorization', userToken3);
  expect(res.statusCode).toBe(403);
});

test('Getting all quizzes for an existing course as a student', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .get(`/api/quizzes/${courseId}`)
    .set('authorization', userToken2);
  expect(res.body).toEqual([
    {
      quizId,
      name: 'Quiz',
      releaseDate: now.getTime(),
      dueDate: deadline.getTime(),
      duration: 60,
      weighting: 10,
      questionCount: 2,
      totalMarks: 4,
    },
  ]);
});

test('Getting a quiz while unauthenticated should fail', async () => {
  const res = await request(server).get('/api/quiz/2000');
  expect(res.statusCode).toBe(401);
});

test('Getting a non-existent quiz should fail', async () => {
  const res = await request(server).get('/api/quiz/2000').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting a quiz from a course without being enrolled should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server).get(`/api/quiz/${quizId}`).set('authorization', userToken3);
  expect(res.statusCode).toBe(403);
});

test('Getting a quiz as an educator shows all questions and answers', async () => {
  const quizId = await createQuiz();
  const res = await request(server).get(`/api/quiz/${quizId}`).set('authorization', userToken1);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    name: 'Quiz',
    description: 'a quiz',
    releaseDate: now.getTime(),
    dueDate: deadline.getTime(),
    duration: 60,
    weighting: 10,
    releaseMarks: false,
    questions: [
      {
        questionNumber: 0,
        questionType: 'Short Answer',
        questionText: 'a short answer q',
        options: [],
        maximumMark: 3,
      },
      {
        questionNumber: 1,
        questionType: 'Multiple Choice',
        questionText: 'a mcq',
        maximumMark: 1,
        options: [
          { optionNumber: 0, optionText: 'option 1', isAnswer: false },
          { optionNumber: 1, optionText: 'option 2', isAnswer: true },
          { optionNumber: 2, optionText: 'option 3', isAnswer: true },
          { optionNumber: 3, optionText: 'option 4', isAnswer: false },
        ],
      },
    ],
  });
});

test('Getting a quiz as a student that has not started it hides all questions', async () => {
  const quizId = await createQuiz();
  const res = await request(server).get(`/api/quiz/${quizId}`).set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    name: 'Quiz',
    description: 'a quiz',
    releaseDate: now.getTime(),
    dueDate: deadline.getTime(),
    duration: 60,
    weighting: 10,
    releaseMarks: false,
    questions: [
      {
        questionNumber: 0,
        maximumMark: 3,
      },
      {
        questionNumber: 1,
        maximumMark: 1,
      },
    ],
  });
});

test('Getting a quiz as a student who has started it but not finished shows questions without answers', async () => {
  const quizId = await createQuiz();
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);

  const res = await request(server).get(`/api/quiz/${quizId}`).set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    name: 'Quiz',
    description: 'a quiz',
    releaseDate: now.getTime(),
    dueDate: deadline.getTime(),
    duration: 60,
    weighting: 10,
    releaseMarks: false,
    questions: [
      {
        questionNumber: 0,
        questionType: 'Short Answer',
        questionText: 'a short answer q',
        options: [],
        maximumMark: 3,
      },
      {
        questionNumber: 1,
        questionType: 'Multiple Choice',
        questionText: 'a mcq',
        maximumMark: 1,
        options: [
          { optionNumber: 0, optionText: 'option 1' },
          { optionNumber: 1, optionText: 'option 2' },
          { optionNumber: 2, optionText: 'option 3' },
          { optionNumber: 3, optionText: 'option 4' },
        ],
      },
    ],
  });
});

test('Getting a quiz with marks released as a student who finished before the due date shows all questions and answers', async () => {
  const quizId = await createQuiz(0);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  await request(server)
    .put(`/api/quiz/${quizId}/release`)
    .set('authorization', userToken1)
    .send({ releaseMarks: true });
  const res = await request(server).get(`/api/quiz/${quizId}`).set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    name: 'Quiz',
    description: 'a quiz',
    releaseDate: now.getTime(),
    dueDate: deadline.getTime(),
    duration: 0,
    weighting: 10,
    releaseMarks: true,
    questions: [
      {
        questionNumber: 0,
        questionType: 'Short Answer',
        questionText: 'a short answer q',
        options: [],
        maximumMark: 3,
      },
      {
        questionNumber: 1,
        questionType: 'Multiple Choice',
        questionText: 'a mcq',
        maximumMark: 1,
        options: [
          { optionNumber: 0, optionText: 'option 1', isAnswer: false },
          { optionNumber: 1, optionText: 'option 2', isAnswer: true },
          { optionNumber: 2, optionText: 'option 3', isAnswer: true },
          { optionNumber: 3, optionText: 'option 4', isAnswer: false },
        ],
      },
    ],
  });
});

test('Getting a quiz with marks not released as a student who finished shows questions only', async () => {
  const quizId = await createQuiz(0);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  const res = await request(server).get(`/api/quiz/${quizId}`).set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    name: 'Quiz',
    description: 'a quiz',
    releaseDate: now.getTime(),
    dueDate: deadline.getTime(),
    duration: 0,
    weighting: 10,
    releaseMarks: false,
    questions: [
      {
        questionNumber: 0,
        questionType: 'Short Answer',
        questionText: 'a short answer q',
        options: [],
        maximumMark: 3,
      },
      {
        questionNumber: 1,
        questionType: 'Multiple Choice',
        questionText: 'a mcq',
        maximumMark: 1,
        options: [
          { optionNumber: 0, optionText: 'option 1' },
          { optionNumber: 1, optionText: 'option 2' },
          { optionNumber: 2, optionText: 'option 3' },
          { optionNumber: 3, optionText: 'option 4' },
        ],
      },
    ],
  });
});

test('Adding a quiz to a course while unauthenticated should fail', async () => {
  const res = await request(server).post('/api/quiz');
  expect(res.statusCode).toBe(401);
});

test('Adding a quiz to a non-existent course should fail', async () => {
  const res = await request(server).post('/api/quiz').set('authorization', userToken1).send({
    courseId: 2000,
  });

  expect(res.statusCode).toBe(404);
});

test('Adding a quiz to a course as a non-educator should fail', async () => {
  const res = await request(server).post('/api/quiz').set('authorization', userToken2).send({
    courseId,
  });

  expect(res.statusCode).toBe(403);
});

test('Adding a quiz to a course as an educator', async () => {
  const res1 = await request(server)
    .post('/api/quiz')
    .set('authorization', userToken1)
    .send({
      courseId,
      name: 'Quiz',
      description: 'a quiz',
      releaseDate: now.getTime(),
      dueDate: deadline.getTime(),
      duration: 60,
      weighting: 10,
      questions: [
        {
          questionType: 'Short Answer',
          questionText: 'a short answer q',
          maximumMark: 3,
        },
        {
          questionType: 'Multiple Choice',
          questionText: 'a mcq',
          maximumMark: 1,
          options: [
            { optionText: 'option 1', isAnswer: false },
            { optionText: 'option 2', isAnswer: true },
            { optionText: 'option 3', isAnswer: true },
            { optionText: 'option 4', isAnswer: false },
          ],
        },
      ],
    });

  expect(res1.statusCode).toBe(200);
  const quizId = res1.body.quizId;

  const res2 = await request(server)
    .get(`/api/quizzes/${courseId}`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual([
    {
      quizId,
      name: 'Quiz',
      releaseDate: now.getTime(),
      dueDate: deadline.getTime(),
      duration: 60,
      weighting: 10,
      questionCount: 2,
      totalMarks: 4,
    },
  ]);
});

test('Updating a quiz while unauthenticated should fail', async () => {
  const res = await request(server).put('/api/quiz');
  expect(res.statusCode).toBe(401);
});

test('Updating a non-existent quiz should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server).put('/api/quiz').set('authorization', userToken1).send({
    quizId: 2000,
  });

  expect(res.statusCode).toBe(404);
});

test('Updating a quiz as a non-educator should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server).put('/api/quiz').set('authorization', userToken2).send({
    quizId,
  });

  expect(res.statusCode).toBe(403);
});

test('Updating a quiz as an educator', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .put('/api/quiz')
    .set('authorization', userToken1)
    .send({
      quizId,
      name: 'Quiz 1',
      description: 'an actual description',
      releaseDate: now.getTime(),
      dueDate: deadline.getTime(),
      duration: 60,
      weighting: 10,
      questions: [{ questionType: 'Short Answer', questionText: 'hi', maximumMark: 5 }],
    });

  expect(res1.statusCode).toBe(200);

  const res2 = await request(server).get(`/api/quiz/${quizId}`).set('authorization', userToken1);
  expect(res2.body).toEqual({
    name: 'Quiz 1',
    description: 'an actual description',
    releaseDate: now.getTime(),
    dueDate: deadline.getTime(),
    duration: 60,
    weighting: 10,
    releaseMarks: false,
    questions: [
      {
        questionNumber: 0,
        questionType: 'Short Answer',
        questionText: 'hi',
        maximumMark: 5,
        options: [],
      },
    ],
  });
});

test('Updating a quiz removes all submissions', async () => {
  const quizId = await createQuiz();
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  await request(server).put('/api/quiz').set('authorization', userToken1).send({
    quizId,
    name: 'Quiz 1',
    description: 'an actual description',
    releaseDate: now.getTime(),
    dueDate: deadline.getTime(),
    duration: 60,
    weighting: 10,
    questions: [],
  });

  const res = await request(server)
    .get(`/api/quiz/${quizId}/submissions`)
    .set('authorization', userToken1);
  expect(res.body).toEqual([]);
});

test('Deleting a quiz while unauthenticated should fail', async () => {
  const res = await request(server).delete('/api/quiz/2000');
  expect(res.statusCode).toBe(401);
});

test('Deleting a non-existent quiz should fail', async () => {
  const res = await request(server).delete('/api/quiz/2000').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Deleting a quiz as a non-educator should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server).delete(`/api/quiz/${quizId}`).set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Deleting a quiz as an educator', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server).delete(`/api/quiz/${quizId}`).set('authorization', userToken1);
  expect(res1.statusCode).toBe(200);

  const res2 = await request(server)
    .get(`/api/quizzes/${courseId}`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual([]);
});

test('Deleting a quiz also deletes its submissions', async () => {
  const quizId = await createQuiz();
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  await request(server).delete(`/api/quiz/${quizId}`).set('authorization', userToken1);
  const res = await request(server)
    .get(`/api/quiz/${quizId}/submission/${userId2}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Getting submissions for a quiz while unauthenticated should fail', async () => {
  const res = await request(server).get('/api/quiz/2000/submissions');
  expect(res.statusCode).toBe(401);
});

test('Getting submissions for a non-existent quiz should fail', async () => {
  const res = await request(server)
    .get('/api/quiz/2000/submissions')
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting submissions for a quiz as a non-educator should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .get(`/api/quiz/${quizId}/submissions`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Getting submissions for a quiz as an educator', async () => {
  const quizId = await createQuiz(60);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  clock.setSystemTime(now.getTime() + 60 * 60 * 1000 + QUIZ_SUBMISSION_BUFFER - 1);
  const res1 = await request(server)
    .get(`/api/quiz/${quizId}/submissions`)
    .set('authorization', userToken1);
  expect(res1.statusCode).toBe(200);
  // Cannot view submissions whose timers have not yet expired
  expect(res1.body).toEqual([]);

  clock.setSystemTime(now.getTime() + 60 * 60 * 1000 + QUIZ_SUBMISSION_BUFFER + 1);
  await request(server)
    .put(`/api/quiz/${quizId}/mark/${userId2}`)
    .set('authorization', userToken1)
    .send({
      questionMarks: [{ questionNumber: 0, mark: 3 }],
    });
  const res2 = await request(server)
    .get(`/api/quiz/${quizId}/submissions`)
    .set('authorization', userToken1);
  expect(res1.statusCode).toBe(200);
  expect(res2.body).toEqual([
    {
      userId: userId2,
      firstName: 'Bob',
      lastName: 'Lee',
      email: 'bl@toodles.com',
      mark: 3,
      markerId: userId1,
      markerFirstName: 'John',
      markerLastName: 'Smith',
    },
  ]);
});

test('Getting own submission while unauthenticated should fail', async () => {
  const res = await request(server).get('/api/quiz/2000/submission');
  expect(res.statusCode).toBe(401);
});

test('Getting own submission for a non-existent quiz should fail', async () => {
  const res = await request(server)
    .get('/api/quiz/2000/submission')
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Getting own submission for a quiz as a non-member should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken3);
  expect(res.statusCode).toBe(403);
});

test('Getting own submission for an unattempted quiz should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Getting own submission for an attempted quiz', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  const startTime = res1.body.startTime;
  await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      quizId,
      answers: [
        { questionNumber: 0, answerText: 'answer' },
        { questionNumber: 1, optionNumber: 2 },
      ],
    });
  const res2 = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res2.statusCode).toBe(200);
  expect(res2.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: 'answer',
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: 2,
      },
    ],
  });
});

test('Getting the submission of a user while unauthenticated should fail', async () => {
  const res = await request(server).get('/api/quiz/2000/submission/2000');
  expect(res.statusCode).toBe(401);
});

test('Getting the submission of a user for a non-existent quiz should fail', async () => {
  const res = await request(server)
    .get('/api/quiz/2000/submission/2000')
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting the submission of a non-existent user should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .get(`/api/quiz/${quizId}/submission/2000`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting the submission of a user that has not attempted the quiz should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .get(`/api/quiz/${quizId}/submission/${userId2}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting the submission of a user as a non-educator should fail', async () => {
  const quizId = await createQuiz();
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken1);
  const res = await request(server)
    .get(`/api/quiz/${quizId}/submission/${userId1}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Getting the submission of a user as an educator', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  const startTime = res1.body.startTime;
  await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumber: 0, answerText: 'answer' },
        { questionNumber: 1, optionNumber: 2 },
      ],
    });
  const res2 = await request(server)
    .get(`/api/quiz/${quizId}/submission/${userId2}`)
    .set('authorization', userToken1);
  expect(res2.statusCode).toBe(200);
  expect(res2.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: 'answer',
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: 2,
      },
    ],
  });
});

test('Starting a quiz while unauthenticated should fail', async () => {
  const res = await request(server).post('/api/quiz/2000/submission');
  expect(res.statusCode).toBe(401);
});

test('Starting a non-existent quiz should fail', async () => {
  const res = await request(server)
    .post('/api/quiz/2000submission')
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Starting an unreleased quiz should fail', async () => {
  const quizId = await createQuiz(10, tomorrow, deadline);
  const res = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Starting a quiz past its due date should fail', async () => {
  const quizId = await createQuiz(10, new Date(1970, 0, 1), yesterday);
  const res = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('User cannot post a submission more than once', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res1.statusCode).toBe(200);
  const res2 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res2.statusCode).toBe(403);
});

test('Starting a quiz makes an empty submission', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res1.statusCode).toBe(200);

  const startTime = res1.body.startTime;
  const res2 = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: null,
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: null,
      },
    ],
  });
});

test('Updating a submission while unauthenticated should fail', async () => {
  const res = await request(server).put('/api/quiz/2000/submission');
  expect(res.statusCode).toBe(401);
});

test('Updating a submission on a non-existent quiz should fail', async () => {
  const res = await request(server)
    .put('/api/quiz/2000/submission')
    .set('authorization', userToken2);

  expect(res.statusCode).toBe(404);
});

test('Updating a submission to a quiz while not enrolled should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken3);

  expect(res.statusCode).toBe(403);
});

test('Updating a submission before starting the quiz should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);

  expect(res.statusCode).toBe(403);
});

test('Making a submission after deadline should fail', async () => {
  const quizId = await createQuiz(60, now, tomorrow);
  clock.setSystemTime(tomorrow.getTime() + 1);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  const res = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);

  expect(res.statusCode).toBe(403);
});

test('Making a complete submission to a quiz', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  const startTime = res1.body.startTime;
  const res2 = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumber: 0, answerText: 'answer' },
        { questionNumber: 1, optionNumber: 1 },
      ],
    });

  expect(res2.statusCode).toBe(200);

  const res3 = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);

  expect(res3.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: 'answer',
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: 1,
      },
    ],
  });
});

test('Making an incomplete submission to a quiz', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  const startTime = res1.body.startTime;
  const res2 = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({ answers: [{ questionNumber: 0, answerText: 'answer' }] });

  expect(res2.statusCode).toBe(200);

  const res3 = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);

  expect(res3.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: 'answer',
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: null,
      },
    ],
  });
});

test('Updating submissions on a quiz multiple times results in only the final submission', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  const startTime = res1.body.startTime;
  await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumber: 0, answerText: 'answer' },
        { questionNumber: 1, optionNumber: 1 },
      ],
    });

  await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumber: 0, answerText: 'new answer' },
        { questionNumber: 1, optionNumber: 3 },
      ],
    });

  const res2 = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);

  expect(res2.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: 'new answer',
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: 3,
      },
    ],
  });
});

test('Updating submissions on a quiz after timer expiry fails', async () => {
  const quizId = await createQuiz();
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  const startTime = res1.body.startTime;

  clock.setSystemTime(now.getTime() + 60 * 60 * 1000 + QUIZ_SUBMISSION_BUFFER - 1);
  const res2 = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumber: 0, answerText: 'answer' },
        { questionNumber: 1, optionNumber: 1 },
      ],
    });

  expect(res2.statusCode).toBe(200);

  clock.setSystemTime(now.getTime() + 60 * 60 * 1000 + QUIZ_SUBMISSION_BUFFER + 1);
  const res3 = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumber: 0, answerText: 'new answer' },
        { questionNumber: 1, optionNumber: 3 },
      ],
    });

  expect(res3.statusCode).toBe(403);

  const res4 = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);

  expect(res4.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: 'answer',
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: 1,
      },
    ],
  });
});

test('Updating submissions on a quiz before timer expiry but after deadline fails', async () => {
  const quizId = await createQuiz(2, now, new Date(now.getTime() + 60 * 1000));
  const res1 = await request(server)
    .post(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);
  const startTime = res1.body.startTime;

  clock.setSystemTime(now.getTime() + 60 * 1000 + QUIZ_SUBMISSION_BUFFER - 1);
  const res2 = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumber: 0, answerText: 'answer' },
        { questionNumber: 1, optionNumber: 1 },
      ],
    });

  expect(res2.statusCode).toBe(200);

  clock.setSystemTime(now.getTime() + 60 * 1000 + QUIZ_SUBMISSION_BUFFER + 1);
  const res3 = await request(server)
    .put(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2)
    .send({
      answers: [
        { questionNumebr: 0, answerText: 'new answer' },
        { questionNumber: 1, optionNumber: 3 },
      ],
    });

  expect(res3.statusCode).toBe(403);

  const res4 = await request(server)
    .get(`/api/quiz/${quizId}/submission`)
    .set('authorization', userToken2);

  expect(res4.body).toEqual({
    startTime,
    answers: [
      {
        questionNumber: 0,
        answerText: 'answer',
        optionNumber: null,
      },
      {
        questionNumber: 1,
        answerText: null,
        optionNumber: 1,
      },
    ],
  });
});

test('Getting own marks for a quiz while unauthenticated should fail', async () => {
  const res = await request(server).get('/api/quiz/2000/mark');
  expect(res.statusCode).toBe(401);
});

test('Getting marks for a non-existent quiz should fail', async () => {
  const res = await request(server).get('/api/quiz/2000/mark').set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Getting marks for an unattempted quiz should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Getting marks for a quiz that has not released marks should fail', async () => {
  const quizId = await createQuiz();
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  const res = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Getting marks for an unfinished quiz with marks released should fail', async () => {
  const quizId = await createQuiz(60);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  await request(server).put(`/api/quiz/${quizId}/release`).set('authorization', userToken1).send({
    releaseMarks: true,
  });
  const res = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Getting marks for a finished quiz with marks released', async () => {
  const quizId = await createQuiz(30);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  await request(server).put(`/api/quiz/${quizId}/release`).set('authorization', userToken1).send({
    releaseMarks: true,
  });
  clock.setSystemTime(now.getTime() + 30 * 60 * 1000 + QUIZ_SUBMISSION_BUFFER + 1);
  await request(server)
    .put(`/api/quiz/${quizId}/mark/${userId2}`)
    .set('authorization', userToken1)
    .send({
      questionMarks: [{ questionNumber: 0, mark: 2 }],
    });
  const res = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([{ questionNumber: 0, mark: 2 }]);
});

test('Marking a submission while unauthenticated should fail', async () => {
  const res = await request(server).put('/api/quiz/2000/mark/2000');
  expect(res.statusCode).toBe(401);
});

test('Marking a non-existent quiz should fail', async () => {
  const res = await request(server)
    .put('/api/quiz/2000/mark/2000')
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Marking a quiz for a non-existent user should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .put(`/api/quiz/${quizId}/mark/2000`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Marking a quiz for a user who has not attempted it should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .put(`/api/quiz/${quizId}/mark/${userId2}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Marking a quiz for a user who has not finished it should fail', async () => {
  const quizId = await createQuiz();
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  const res = await request(server)
    .put(`/api/quiz/${quizId}/mark/${userId2}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(403);
});

test('Marking a quiz for a user as a non-educator should fail', async () => {
  const quizId = await createQuiz(0);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  const res = await request(server)
    .put(`/api/quiz/${quizId}/mark/${userId2}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Marking a quiz for a user that has finished it as an educator', async () => {
  const quizId = await createQuiz(10, now, now);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  await request(server).put(`/api/quiz/${quizId}/release`).set('authorization', userToken1).send({
    releaseMarks: true,
  });
  clock.setSystemTime(now.getTime() + QUIZ_SUBMISSION_BUFFER + 1);
  const res1 = await request(server)
    .put(`/api/quiz/${quizId}/mark/${userId2}`)
    .set('authorization', userToken1)
    .send({
      questionMarks: [{ questionNumber: 0, mark: 2 }],
    });
  expect(res1.statusCode).toBe(200);
  const res2 = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual([{ questionNumber: 0, mark: 2 }]);
});

test('Releasing quiz marks while unauthenticated should fail', async () => {
  const res = await request(server).put('/api/quiz/2000/release');
  expect(res.statusCode).toBe(401);
});

test('Releasing marks for a non-existent quiz should fail', async () => {
  const res = await request(server).put('/api/quiz/2000/release').set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Releasing quiz marks as a non-educator should fail', async () => {
  const quizId = await createQuiz();
  const res = await request(server)
    .put(`/api/quiz/${quizId}/release`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Releasing quiz marks as an educator', async () => {
  const quizId = await createQuiz(60);
  await request(server).post(`/api/quiz/${quizId}/submission`).set('authorization', userToken2);
  const res = await request(server)
    .put(`/api/quiz/${quizId}/release`)
    .set('authorization', userToken1)
    .send({
      releaseMarks: true,
    });
  expect(res.statusCode).toBe(200);

  // check that marks are still not visible before timer expiry
  clock.setSystemTime(now.getTime() + 60 * 60 * 1000 + QUIZ_SUBMISSION_BUFFER - 1);
  const res2 = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res2.statusCode).toBe(403);

  // check that marks are visible before timer expiry
  clock.setSystemTime(now.getTime() + 60 * 60 * 1000 + QUIZ_SUBMISSION_BUFFER + 1);
  const res3 = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res3.statusCode).toBe(200);

  // unrelease marks then check marks are not visible
  const res4 = await request(server)
    .put(`/api/quiz/${quizId}/release`)
    .set('authorization', userToken1)
    .send({
      releaseMarks: false,
    });
  expect(res4.statusCode).toBe(200);
  const res5 = await request(server)
    .get(`/api/quiz/${quizId}/mark`)
    .set('authorization', userToken2);
  expect(res5.statusCode).toBe(403);
});
