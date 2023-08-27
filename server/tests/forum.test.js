const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { server } = require('../server');
const { DB_PATH, FILE_PATH } = require('../utils/constants');
const { sendMailMock } = require('./mocks.js');

jest.mock('nodemailer');

// Helper variables
let educator;
let student;
let nonMember;
let courseId;
let postIdStudent;
let postIdEducator;
let replyIdStudent;
let replyIdEducator;
let educatorOnlyCategory;
let studentCategory;

// Set up users and course membership
beforeAll(async () => {
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

  const res3 = await request(server).post('/api/auth/user').send({
    email: 'user3@toodles.com',
    password: 'password',
    firstName: 'Elizabeth',
    lastName: 'Bennett',
  });
  nonMember = res3.body;

  await request(server)
    .post('/api/courses')
    .set('authorization', educator.token)
    .send({
      courseName: 'Course 1',
      members: [{ email: 'user2@toodles.com', role: 'Student' }],
    });

  const res4 = await request(server).get('/api/courses').set('authorization', student.token);
  courseId = res4.body[0].courseId;
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  fs.rmSync(FILE_PATH, { recursive: true, force: true });
  await server.close();
});

test('Unauthenticated users cannot fetch posts', async () => {
  const res1 = await request(server).get(`/api/posts/${courseId}`);
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
});

test('Non members cannot fetch posts', async () => {
  const res1 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', nonMember.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You do not have permission to fetch posts for course with id ${courseId}`
  );
});

test('Unauthenticated users cannot update categories', async () => {
  const res1 = await request(server)
    .put('/api/categories')
    .send({
      courseId,
      categories: [
        { categoryName: 'Announcements', categoryColor: 'pink', selectableForStudents: false },
      ],
    });
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
});

test('Non members cannot update categories', async () => {
  const res1 = await request(server)
    .put('/api/categories')
    .set('authorization', student.token)
    .send({
      courseId,
      categories: [
        { categoryName: 'Lectures', categoryColor: 'yellow', selectableForStudents: true },
      ],
    });
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You do not have permission to change forum categories in course with id ${courseId}`
  );
});

test('Educators can add forum categories', async () => {
  // Add category
  const res1 = await request(server)
    .put('/api/categories')
    .set('authorization', educator.token)
    .send({
      courseId,
      categories: [
        { categoryName: 'Announcements', categoryColor: 'pink', selectableForStudents: false },
      ],
    });
  expect(res1.statusCode).toEqual(200);
  // Ensure category has been added
  const res2 = await request(server)
    .get(`/api/categories/${courseId}`)
    .set('authorization', educator.token);
  expect(res2.body).toEqual([
    expect.objectContaining({
      categoryName: 'Announcements',
      categoryColor: 'pink',
      selectableForStudents: false,
    }),
  ]);
});

test('Educators can change forum categories', async () => {
  // Change categories
  const res1 = await request(server)
    .get(`/api/categories/${courseId}`)
    .set('authorization', educator.token);
  const existingCategory = { ...res1.body[0] };
  existingCategory.categoryName = 'Important Notices';
  existingCategory.categoryColor = 'yellow';
  const res2 = await request(server)
    .put('/api/categories')
    .set('authorization', educator.token)
    .send({
      courseId,
      categories: [
        existingCategory,
        { categoryName: 'Lectures', categoryColor: 'pink', selectableForStudents: true },
      ],
    });
  expect(res2.statusCode).toEqual(200);
  // Ensure categories have been properly updated
  const res3 = await request(server)
    .get(`/api/categories/${courseId}`)
    .set('authorization', educator.token);
  expect(res3.body.length).toEqual(2);
  expect(res3.body).toEqual(
    expect.arrayContaining([
      existingCategory,
      expect.objectContaining({
        categoryName: 'Lectures',
        categoryColor: 'pink',
        selectableForStudents: true,
      }),
    ])
  );
  educatorOnlyCategory = existingCategory;
  studentCategory =
    res3.body[0].categoryId === existingCategory.categoryId ? res3.body[1] : res3.body[2];
});

test('Categories outside of the specified course cannot be edited', async () => {
  const res1 = await request(server)
    .put('/api/categories')
    .set('authorization', educator.token)
    .send({
      courseId,
      categories: [
        {
          categoryId: -1,
          categoryName: 'Lectures',
          categoryColor: 'pink',
          selectableForStudents: true,
        },
      ],
    });
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(
    `One of the forum categories not found in course with id ${courseId}`
  );
});

test('Course members can fetch forum categories', async () => {
  const res1 = await request(server)
    .get(`/api/categories/${courseId}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(200);
  expect(res1.body).toEqual(expect.arrayContaining([educatorOnlyCategory, studentCategory]));
});

test('Unauthenticated users cannot create forum posts', async () => {
  // Attempt to make post
  const res1 = await request(server).post('/api/post').field('courseId', courseId);
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
  // Ensure post was not made
  const res2 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res2.body.length).toEqual(0);
});

test('Non members cannot create forum posts', async () => {
  // Attempt to make post
  const res1 = await request(server)
    .post('/api/post')
    .set('authorization', nonMember.token)
    .field('courseId', courseId);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You do not have permission to write a forum post in course with id ${courseId}`
  );
  const res2 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res2.body.length).toEqual(0);
});

test('Students cannot create posts in categories that are not selectable by students', async () => {
  // Attempt to make post
  const res1 = await request(server)
    .post('/api/post')
    .set('authorization', student.token)
    .send({
      courseId,
      title: 'Post Title',
      text: 'Some content',
      categoryId: educatorOnlyCategory.categoryId,
      files: [{ originalname: 'abc.pdf', path: 'xyz' }],
    });
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You do not have permission to post in category with id ${educatorOnlyCategory.categoryId}`
  );
  // Ensure post was not made
  const res2 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res2.body.length).toEqual(0);
});

test('Course members can make forum posts', async () => {
  // Make post
  const res1 = await request(server)
    .post('/api/post')
    .field('courseId', courseId)
    .field('title', 'Post Title')
    .field('categoryId', studentCategory.categoryId)
    .field('shouldNotifyStudents', false)
    .field('text', 'Some content')
    .attach('files', path.resolve(__dirname, './files/dog.jpeg'))
    .attach('files', path.resolve(__dirname, './files/pdf.pdf'))
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(200);
  const { postId } = res1.body;
  const res2 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  // Ensure post was made
  expect(res2.body).toEqual([
    expect.objectContaining({
      postId,
      title: 'Post Title',
      text: 'Some content',
      categoryId: studentCategory.categoryId,
      categoryName: studentCategory.categoryName,
      categoryColor: studentCategory.categoryColor,
      userId: student.userId,
      firstName: 'John',
      lastName: 'Doe',
    }),
  ]);
  postIdStudent = postId;
});

test('Educators can make forum posts in categories not selectable by students', async () => {
  // Make post
  const res1 = await request(server)
    .post('/api/post')
    .field('courseId', courseId)
    .field('title', 'Educator Post Title')
    .field('categoryId', educatorOnlyCategory.categoryId)
    .field('text', 'More content')
    .set('authorization', educator.token);
  expect(res1.statusCode).toEqual(200);
  const { postId } = res1.body;
  // Ensure post was made
  const res2 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res2.body.length).toEqual(2);
  expect(res2.body).toContainEqual(
    expect.objectContaining({
      postId,
      title: 'Educator Post Title',
      text: 'More content',
      categoryId: educatorOnlyCategory.categoryId,
      categoryName: educatorOnlyCategory.categoryName,
      categoryColor: educatorOnlyCategory.categoryColor,
      userId: educator.userId,
      firstName: 'Jane',
      lastName: 'Smith',
    })
  );
  postIdEducator = postId;
});

test('Members cannot make a forum post in category outside of the course', async () => {
  // Attempt to make post
  const res1 = await request(server)
    .post('/api/post')
    .field('courseId', courseId)
    .field('title', 'Educator Post Title')
    .field('categoryId', -1)
    .field('text', 'More content')
    .set('authorization', educator.token);
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Category with id -1 not found in course with id ${courseId}`);
  const { postId } = res1.body;
  // Ensure no post was made
  const res2 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res2.body.length).toEqual(2);
});

test('Unauthenticated users cannot get a forum post', async () => {
  const res1 = await request(server).get(`/api/post/${postIdStudent}`);
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
});

test('Non members cannot get a forum post', async () => {
  const res1 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', nonMember.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You do not have permission to access post with id ${postIdStudent}`
  );
});

test('Members can get a forum post', async () => {
  const res1 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res1.body).toMatchObject({
    title: 'Post Title',
    text: 'Some content',
    categoryId: studentCategory.categoryId,
    categoryName: studentCategory.categoryName,
    categoryColor: studentCategory.categoryColor,
    userId: student.userId,
    firstName: 'John',
    lastName: 'Doe',
    replies: [],
    files: [
      expect.objectContaining({ fileName: 'dog.jpeg' }),
      expect.objectContaining({ fileName: 'pdf.pdf' }),
    ],
  });
});

test('Attempting to update a forum post while unauthenticated should fail', async () => {
  // Attempt to edit post
  const res1 = await request(server)
    .put('/api/post')
    .field('postId', postIdStudent)
    .field('title', 'New post title')
    .field('categoryId', studentCategory.categoryId)
    .field('content', 'New content');
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
  // Ensure post was not changed
  const res2 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res2.body).toMatchObject({
    title: 'Post Title',
    text: 'Some content',
    categoryId: studentCategory.categoryId,
    categoryName: studentCategory.categoryName,
    categoryColor: studentCategory.categoryColor,
    userId: student.userId,
    firstName: 'John',
    lastName: 'Doe',
    replies: [],
    files: [
      expect.objectContaining({ fileName: 'dog.jpeg' }),
      expect.objectContaining({ fileName: 'pdf.pdf' }),
    ],
  });
});

test('Students cannot edit a post if they did not create it', async () => {
  // Attempt to edit post
  const res1 = await request(server)
    .put('/api/post')
    .field('postId', postIdEducator)
    .field('title', 'New post title')
    .field('text', 'New content')
    .field('categoryId', studentCategory.categoryId)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You do not have permission to edit post with id ${postIdEducator}`
  );
  // Ensure post was not edited
  const res2 = await request(server)
    .get(`/api/post/${postIdEducator}`)
    .set('authorization', student.token);
  expect(res2.body).toMatchObject({
    title: 'Educator Post Title',
    text: 'More content',
    categoryId: educatorOnlyCategory.categoryId,
    categoryName: educatorOnlyCategory.categoryName,
    categoryColor: educatorOnlyCategory.categoryColor,
    userId: educator.userId,
    firstName: 'Jane',
    lastName: 'Smith',
    replies: [],
    files: [],
  });
});

test('Students cannot move a post into a category not selectable by students', async () => {
  // Attempt to edit post
  const res1 = await request(server)
    .put('/api/post')
    .field('postId', postIdStudent)
    .field('title', 'New post title')
    .field('text', 'New content')
    .field('categoryId', educatorOnlyCategory.categoryId)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You cannot post in category with id ${educatorOnlyCategory.categoryId}`
  );
  // Ensure post was not edited
  const res2 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res2.body).toMatchObject({
    title: 'Post Title',
    text: 'Some content',
    categoryId: studentCategory.categoryId,
    categoryName: studentCategory.categoryName,
    categoryColor: studentCategory.categoryColor,
    userId: student.userId,
    firstName: 'John',
    lastName: 'Doe',
    replies: [],
    files: [
      expect.objectContaining({ fileName: 'dog.jpeg' }),
      expect.objectContaining({ fileName: 'pdf.pdf' }),
    ],
  });
});

test('Creator of posts can update forum posts', async () => {
  // Update post
  const res1 = await request(server)
    .put('/api/post')
    .field('postId', postIdStudent)
    .field('title', 'New post title')
    .field('text', 'New content')
    .field('categoryId', studentCategory.categoryId)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(200);
  // Ensure post was updated
  const res2 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res2.body).toMatchObject({
    title: 'New post title',
    text: 'New content',
    categoryId: studentCategory.categoryId,
    categoryName: studentCategory.categoryName,
    categoryColor: studentCategory.categoryColor,
    files: [],
    replies: [],
  });
});

test('Educators can edit and delete forum posts', async () => {
  // Make student create post
  const res1 = await request(server)
    .post('/api/post')
    .set('authorization', student.token)
    .field('courseId', courseId)
    .field('title', 'Just another post')
    .field('text', 'Some other content');
  const { postId } = res1.body;
  // Update post
  const res2 = await request(server)
    .put('/api/post')
    .field('postId', postId)
    .field('title', 'Even newer post title')
    .field('text', 'Even newer content')
    .field('categoryId', studentCategory.categoryId)
    .set('authorization', educator.token);
  expect(res2.statusCode).toEqual(200);
  const res3 = await request(server).get(`/api/post/${postId}`).set('authorization', student.token);
  // Ensure post was updated
  expect(res3.body).toMatchObject({
    title: 'Even newer post title',
    text: 'Even newer content',
    categoryId: studentCategory.categoryId,
    categoryName: studentCategory.categoryName,
    categoryColor: studentCategory.categoryColor,
    files: [],
    replies: [],
  });
  // Delete post
  const res4 = await request(server)
    .delete(`/api/post/${postId}`)
    .set('authorization', educator.token);
  expect(res4.statusCode).toEqual(200);
  // Ensure post was deleted
  const res5 = await request(server).get(`/api/post/${postId}`).set('authorization', student.token);
  expect(res5.statusCode).toEqual(404);
  expect(res5.body.message).toEqual(`Post with id ${postId} not found`);
});

test('Unauthenticated users cannot reply to forum posts', async () => {
  // Attempt to make reply
  const res1 = await request(server)
    .post('/api/reply')
    .field('postId', postIdStudent)
    .field('text', 'A reply');
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
  // Ensure no reply was made
  const res2 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res2.body.replies.length).toEqual(0);
});

test('Non members cannot reply to forum posts', async () => {
  // Attempt to make reply
  const res1 = await request(server)
    .post('/api/reply')
    .set('authorization', nonMember.token)
    .field('postId', postIdStudent)
    .field('text', 'A reply')
    .attach('files', path.resolve(__dirname, './files/dog.jpeg'));
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(`You cannot reply to post with id ${postIdStudent}`);
  // Ensure no reply was made
  const res2 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res2.body.replies.length).toEqual(0);
});

test('Course members can reply to forum posts', async () => {
  // Make reply
  const res1 = await request(server)
    .post('/api/reply')
    .set('authorization', student.token)
    .field('postId', postIdEducator)
    .field('text', 'A reply')
    .attach('files', path.resolve(__dirname, './files/dog.jpeg'));
  expect(res1.statusCode).toEqual(200);
  replyIdStudent = res1.body.replyId;
  // Ensure reply was made
  const res2 = await request(server)
    .get(`/api/post/${postIdEducator}`)
    .set('authorization', student.token);
  expect(res2.body.replies.length).toEqual(1);
  expect(res2.body.replies).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        text: 'A reply',
        userId: student.userId,
        firstName: 'John',
        lastName: 'Doe',
      }),
    ])
  );
  expect(res2.body.replies[0].files).toEqual(
    expect.arrayContaining([expect.objectContaining({ fileName: 'dog.jpeg' })])
  );
});

test('Unauthenticated users cannot read replies', async () => {
  const res1 = await request(server).get(`/api/reply/${replyIdStudent}`);
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
});

test('Non members cannot read replies', async () => {
  const res1 = await request(server)
    .get(`/api/reply/${replyIdStudent}`)
    .set('authorization', nonMember.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(`You cannot read the reply with id ${replyIdStudent}`);
});

test('Unauthenticated users cannot edit replies', async () => {
  // Attempt to edit reply
  const res1 = await request(server)
    .put('/api/reply')
    .field('replyId', replyIdStudent)
    .field('text', 'New reply');
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
  // Ensure reply was not changed
  const res2 = await request(server)
    .get(`/api/reply/${replyIdStudent}`)
    .set('authorization', student.token);
  expect(res2.body).toMatchObject({
    text: 'A reply',
  });
  expect(res2.body.files).toEqual([expect.objectContaining({ fileName: 'dog.jpeg' })]);
});

test('A user cannot edit a reply if they are not the creator of the reply or an educator of the course', async () => {
  // Create reply
  const res1 = await request(server)
    .post('/api/reply')
    .set('authorization', educator.token)
    .field('postId', postIdStudent)
    .field('text', 'Another reply');
  replyIdEducator = res1.body.replyId;
  // Ensure an error is returned when student tries to edit another member's reply
  const res2 = await request(server)
    .put('/api/reply')
    .set('authorization', student.token)
    .field('replyId', replyIdEducator)
    .field('text', 'New reply');
  expect(res2.statusCode).toEqual(403);
  expect(res2.body.message).toEqual(`You cannot edit the reply with id ${replyIdEducator}`);
  // Ensure reply is unchanged
  const res3 = await request(server)
    .get(`/api/reply/${replyIdEducator}`)
    .set('authorization', student.token);
  expect(res3.body).toMatchObject({
    userId: educator.userId,
    firstName: 'Jane',
    lastName: 'Smith',
    text: 'Another reply',
    files: [],
  });
});

test('Creator of replies can edit reply', async () => {
  // Edit reply
  const res1 = await request(server)
    .put('/api/reply')
    .set('authorization', student.token)
    .field('replyId', replyIdStudent)
    .field('text', 'Updated reply');
  expect(res1.statusCode).toEqual(200);
  // Ensure reply is changed
  const res2 = await request(server)
    .get(`/api/reply/${replyIdStudent}`)
    .set('authorization', student.token);
  expect(res2.body).toMatchObject({
    userId: student.userId,
    firstName: 'John',
    lastName: 'Doe',
    text: 'Updated reply',
    files: [],
  });
});

test('Unauthenticated users cannot delete replies', async () => {
  const res1 = await request(server).delete(`/api/reply/${replyIdStudent}`);
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
  // Ensure reply still exists
  const res2 = await request(server)
    .get(`/api/reply/${replyIdStudent}`)
    .set('authorization', student.token);
  expect(res2.statusCode).toEqual(200);
  const res3 = await request(server)
    .get(`/api/post/${postIdEducator}`)
    .set('authorization', student.token);
  expect(res3.body.replies).toContainEqual(expect.objectContaining({ replyId: replyIdStudent }));
});

test('A user cannot delete a reply if they are not the creator of the reply or educator of course', async () => {
  const res1 = await request(server)
    .delete(`/api/reply/${replyIdEducator}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(`You cannot delete the reply with id ${replyIdEducator}`);
  // Ensure reply still exists
  const res2 = await request(server)
    .get(`/api/reply/${replyIdEducator}`)
    .set('authorization', student.token);
  expect(res2.statusCode).toEqual(200);
  const res3 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res3.body.replies).toContainEqual(expect.objectContaining({ replyId: replyIdEducator }));
});

test('Creator of replies can delete reply', async () => {
  const res1 = await request(server)
    .delete(`/api/reply/${replyIdStudent}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(200);
  // Ensure reply has been deleted
  const res2 = await request(server)
    .get(`/api/reply/${replyIdStudent}`)
    .set('authorization', student.token);
  expect(res2.statusCode).toEqual(404);
  expect(res2.body.message).toEqual(`Reply with id ${replyIdStudent} not found`);
  // ... and is no longer part of the post
  const res3 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res3.body.replies).not.toContainEqual(
    expect.objectContaining({ replyId: replyIdStudent })
  );
});

test('Educators can edit and delete replies', async () => {
  // Make student create reply
  const res1 = await request(server)
    .post('/api/reply')
    .set('authorization', student.token)
    .field('postId', postIdStudent)
    .field('text', 'Another reply');
  // Make educator update reply
  const res2 = await request(server)
    .put('/api/reply')
    .set('authorization', educator.token)
    .field('replyId', res1.body.replyId)
    .field('text', 'Updated by a teacher');
  expect(res2.statusCode).toEqual(200);
  // Ensure reply was updated
  const res3 = await request(server)
    .get(`/api/reply/${res1.body.replyId}`)
    .set('authorization', educator.token);
  expect(res3.body).toMatchObject({
    userId: student.userId,
    firstName: 'John',
    lastName: 'Doe',
    text: 'Updated by a teacher',
    files: [],
  });
  // Delete reply
  const res4 = await request(server)
    .delete(`/api/reply/${res1.body.replyId}`)
    .set('authorization', educator.token);
  expect(res4.statusCode).toEqual(200);
  // Ensure reply no longer exists
  const res5 = await request(server)
    .get(`/api/reply/${res1.body.replyId}`)
    .set('authorization', student.token);
  expect(res5.statusCode).toEqual(404);
  expect(res5.body.message).toEqual(`Reply with id ${res1.body.replyId} not found`);
});

test('Unauthenticated users cannot delete a forum post', async () => {
  // Attempt to delete post
  const res1 = await request(server).delete(`/api/post/${postIdStudent}`);
  expect(res1.statusCode).toEqual(401);
  expect(res1.body.message).toEqual('unauthenticated');
  // Check post still exists
  const res2 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res2.statusCode).toEqual(200);
  const res3 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res3.body).toContainEqual(expect.objectContaining({ postId: postIdStudent }));
});

test('Attempting to delete a forum post when not the creator of post or an educator should fail', async () => {
  // Attempt to delete post
  const res1 = await request(server)
    .delete(`/api/post/${postIdEducator}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(403);
  expect(res1.body.message).toEqual(
    `You do not have permission to delete post with id ${postIdEducator}`
  );
  // Check post still exists
  const res2 = await request(server)
    .get(`/api/post/${postIdEducator}`)
    .set('authorization', student.token);
  expect(res2.statusCode).toEqual(200);
  const res3 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res3.body).toContainEqual(expect.objectContaining({ postId: postIdEducator }));
});

test('Creators of posts can delete forum posts', async () => {
  // Delete post
  const res1 = await request(server)
    .delete(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(200);
  // Check post no longer exists
  const res2 = await request(server)
    .get(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res2.statusCode).toEqual(404);
  expect(res2.body.message).toEqual(`Post with id ${postIdStudent} not found`);
  const res3 = await request(server)
    .get(`/api/posts/${courseId}`)
    .set('authorization', student.token);
  expect(res3.body).not.toContainEqual(expect.objectContaining({ postId: postIdStudent }));
  // Check replies no longer exist
  const res4 = await request(server)
    .get(`/api/reply/${replyIdEducator}`)
    .set('authorization', educator.token);
  expect(res4.statusCode).toEqual(404);
  expect(res4.body.message).toEqual(`Reply with id ${replyIdEducator} not found`);
});

test('Educators can delete forum categories', async () => {
  // Change categories
  const res1 = await request(server)
    .put('/api/categories')
    .set('authorization', educator.token)
    .send({
      courseId,
      categories: [],
    });
  expect(res1.statusCode).toEqual(200);
  // Ensure categories have been properly deleted
  const res2 = await request(server)
    .get(`/api/categories/${courseId}`)
    .set('authorization', educator.token);
  expect(res2.body.length).toEqual(0);
  // Ensure posts under categories still exist, but now have a null category
  const res3 = await request(server).get(`/api/post/${postIdEducator}`);
  expect(res3.body.categoryId).not.toBeTruthy();
});

test('Moving a post to a non-existent category should fail', async () => {
  // Change categories
  const res1 = await request(server)
    .put('/api/post')
    .set('authorization', educator.token)
    .field('postId', postIdEducator)
    .field('categoryId', educatorOnlyCategory.categoryId)
    .field('title', 'Title')
    .field('text', 'some text');
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(
    `Category with id ${educatorOnlyCategory.categoryId} not found in course with id ${courseId}`
  );
  // Ensure post has remained the same
  const res2 = await request(server)
    .get(`/api/post/${postIdEducator}`)
    .set('authorization', student.token);
  expect(res2.body).toMatchObject({
    title: 'Educator Post Title',
    text: 'More content',
    categoryId: null,
    categoryName: null,
    categoryColor: null,
    userId: educator.userId,
    firstName: 'Jane',
    lastName: 'Smith',
    replies: [],
    files: [],
  });
});

test('Editing a non-existent reply should fail', async () => {
  const res1 = await request(server)
    .put('/api/reply')
    .set('authorization', educator.token)
    .field('replyId', replyIdEducator)
    .field('text', 'A reply');
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Reply with id ${replyIdEducator} not found`);
});

test('Deleting a non-existent reply should fail', async () => {
  const res1 = await request(server)
    .delete(`/api/reply/${replyIdEducator}`)
    .set('authorization', educator.token);
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Reply with id ${replyIdEducator} not found`);
});

test('Editing a non-existent post should fail', async () => {
  const res1 = await request(server)
    .put('/api/post')
    .set('authorization', student.token)
    .field('postId', postIdStudent)
    .field('text', 'Some text')
    .field('title', 'Some title');
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Post with id ${postIdStudent} not found`);
});

test('Deleting a non-existent post should fail', async () => {
  const res1 = await request(server)
    .delete(`/api/post/${postIdStudent}`)
    .set('authorization', student.token);
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Post with id ${postIdStudent} not found`);
});

test('Users cannot reply to non-existent post', async () => {
  // Attempt to make reply
  const res1 = await request(server)
    .post('/api/reply')
    .set('authorization', student.token)
    .field('postId', postIdStudent)
    .field('text', 'A reply')
    .attach('files', path.resolve(__dirname, './files/dog.jpeg'));
  expect(res1.statusCode).toEqual(404);
  expect(res1.body.message).toEqual(`Post with id ${postIdStudent} not found`);
});

test('Updating post with shouldNotifyStudents set to true should call sendMail once for everyone in the course', async () => {
  const res1 = await request(server).put('/api/post').set('authorization', educator.token).send({
    postId: postIdEducator,
    title: 'Test 2',
    text: 'The first test',
    shouldNotifyStudents: true,
  });
  expect(res1.statusCode).toEqual(200);
  expect(sendMailMock).toHaveBeenCalledTimes(2);
  expect([sendMailMock.mock.calls[0][0], sendMailMock.mock.calls[1][0]]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ to: 'user1@toodles.com' }),
      expect.objectContaining({ to: 'user2@toodles.com' }),
    ])
  );
});

test('Posting with shouldNotifyStudents set to true should call sendMail once for everyone in the course', async () => {
  const res1 = await request(server).post('/api/post').set('authorization', educator.token).send({
    courseId,
    title: 'Another post',
    text: 'Just another post...',
    shouldNotifyStudents: true,
  });
  expect(res1.statusCode).toEqual(200);
  expect(sendMailMock).toHaveBeenCalledTimes(2);
  expect([sendMailMock.mock.calls[0][0], sendMailMock.mock.calls[1][0]]).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ to: 'user1@toodles.com' }),
      expect.objectContaining({ to: 'user2@toodles.com' }),
    ])
  );
});

test('Students cannot notify other students', async () => {
  const res1 = await request(server).post('/api/post').set('authorization', student.token).send({
    courseId,
    title: 'Another post',
    text: 'Just another post...',
    shouldNotifyStudents: true,
  });
  expect(sendMailMock).toHaveBeenCalledTimes(0);
  const res2 = await request(server).post('/api/post').set('authorization', student.token).send({
    courseId,
    title: 'Another post',
    text: 'Just another post...',
  });
  expect(res2.statusCode).toEqual(200);
  const { postId } = res2.body;
  await request(server).put('/api/post').set('authorization', student.token).send({
    postId,
    title: 'Another post',
    text: 'Just another post...',
    shouldNotifyStudents: true,
  });
  expect(sendMailMock).toHaveBeenCalledTimes(0);
});
