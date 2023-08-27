const request = require('supertest');
const fs = require('fs');
const { server } = require('../server');
const { DB_PATH, BADGE_CODE_LENGTH } = require('../utils/constants');
const { db } = require('../scripts/database');

let courseId;
let userToken1;
let userToken2;
let userToken3;
let userToken4;
let userId2;
let userId3;
let userId4;
let goldCode;
let silverCode;
let bronzeCode;
const invalidCode = 'X'.repeat(BADGE_CODE_LENGTH + 1);

async function obtainAchievement(token, code) {
  await request(server)
    .post(`/api/leaderboard/${courseId}/code`)
    .set('authorization', token)
    .send({ achievementCode: code });
}

beforeAll(async () => {
  const res1 = await request(server).post('/api/auth/user').send({
    email: 'cc@toodles.com',
    password: 'xxxx',
    firstName: 'Course',
    lastName: 'Creator',
  });

  const res2 = await request(server).post('/api/auth/user').send({
    email: 's1@toodles.com',
    password: 'xxxx',
    firstName: 'Student',
    lastName: 'One',
  });

  const res3 = await request(server).post('/api/auth/user').send({
    email: 's2@toodles.com',
    password: 'xxxx',
    firstName: 'Student',
    lastName: 'Two',
  });

  const res4 = await request(server).post('/api/auth/user').send({
    email: 'nm@toodles.com',
    password: 'xxxx',
    firstName: 'Non',
    lastName: 'Member',
  });

  userToken1 = res1.body.token;
  userToken2 = res2.body.token;
  userToken3 = res3.body.token;
  userToken4 = res4.body.token;
  userId2 = res2.body.userId;
  userId3 = res3.body.userId;
  userId4 = res4.body.userId;

  const res5 = await request(server)
    .post('/api/courses')
    .set('authorization', userToken1)
    .send({
      courseName: 'COMP3900',
      members: [
        { email: 's1@toodles.com', role: 'Student' },
        { email: 's2@toodles.com', role: 'Student' },
      ],
    });

  courseId = res5.body.courseId;
});

beforeEach(async () => {
  const res1 = await request(server)
    .post(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken1)
    .send({ achievementName: 'G', type: 'Gold' });

  const res2 = await request(server)
    .post(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken1)
    .send({ achievementName: 'S', type: 'Silver' });

  const res3 = await request(server)
    .post(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken1)
    .send({ achievementName: 'B', type: 'Bronze' });

  goldCode = res1.body.achievementCode;
  silverCode = res2.body.achievementCode;
  bronzeCode = res3.body.achievementCode;
});

afterEach(() => {
  db.prepare('DELETE FROM achievements').run();
});

afterAll(async () => {
  fs.unlinkSync(DB_PATH);
  await server.close();
});

test('Getting the leaderboard overview while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/leaderboard/${courseId}/overview`);
  expect(res.statusCode).toBe(401);
});

test('Getting the leaderboard overview for a non-existent course should fail', async () => {
  const res = await request(server)
    .get('/api/leaderboard/2000/overview')
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting the leaderboard overview as a non-member should fail', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/overview`)
    .set('authorization', userToken4);
  expect(res.statusCode).toBe(403);
});

test('Getting the leaderboard overview with no one owning achievements', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/overview`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([
    {
      rank: 1,
      userId: userId2,
      firstName: 'Student',
      lastName: 'One',
      email: 's1@toodles.com',
      gold: 0,
      silver: 0,
      bronze: 0,
    },
    {
      rank: 1,
      userId: userId3,
      firstName: 'Student',
      lastName: 'Two',
      email: 's2@toodles.com',
      gold: 0,
      silver: 0,
      bronze: 0,
    },
  ]);
});

test('Getting the leaderboard overview with a student with a achievement and the other without', async () => {
  // Give silver to only one student
  await obtainAchievement(userToken3, silverCode);

  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/overview`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([
    {
      rank: 1,
      userId: userId3,
      firstName: 'Student',
      lastName: 'Two',
      email: 's2@toodles.com',
      gold: 0,
      silver: 1,
      bronze: 0,
    },
    {
      rank: 2,
      userId: userId2,
      firstName: 'Student',
      lastName: 'One',
      email: 's1@toodles.com',
      gold: 0,
      silver: 0,
      bronze: 0,
    },
  ]);
});

test('Getting the leaderboard overview with tied gold and silver achievements', async () => {
  // Give one gold and silver to both students, but one bronze to only one of them
  await obtainAchievement(userToken2, goldCode);
  await obtainAchievement(userToken2, silverCode);
  await obtainAchievement(userToken2, bronzeCode);
  await obtainAchievement(userToken3, goldCode);
  await obtainAchievement(userToken3, silverCode);

  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/overview`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual([
    {
      rank: 1,
      userId: userId2,
      firstName: 'Student',
      lastName: 'One',
      email: 's1@toodles.com',
      gold: 1,
      silver: 1,
      bronze: 1,
    },
    {
      rank: 2,
      userId: userId3,
      firstName: 'Student',
      lastName: 'Two',
      email: 's2@toodles.com',
      gold: 1,
      silver: 1,
      bronze: 0,
    },
  ]);
});

test('Getting list of owned achievements while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/leaderboard/${courseId}/user`);
  expect(res.statusCode).toBe(401);
});

test('Getting list of owned achievements in non-existent course should fail', async () => {
  const res = await request(server)
    .get('/api/leaderboard/2000/user')
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Getting list of owned achievements as a non-member should fail', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/user`)
    .set('authorization', userToken4);
  expect(res.statusCode).toBe(403);
});

test('Getting list of owned achievements in a course', async () => {
  await obtainAchievement(userToken2, goldCode);
  await obtainAchievement(userToken2, bronzeCode);
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/user`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(2);
  expect(res.body).toContainEqual({
    achievementCode: goldCode,
    achievementName: 'G',
    type: 'Gold',
  });
  expect(res.body).toContainEqual({
    achievementCode: bronzeCode,
    achievementName: 'B',
    type: 'Bronze',
  });
});

test('Getting list of achievements of another usre while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/leaderboard/${courseId}/user/${userId2}`);
  expect(res.statusCode).toBe(401);
});

test('Getting list of achievements of another user in a non-existent course should fail', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/2000/user/${userId2}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting list of achievements of another user as a non-educator should fail', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/user/${userId3}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Getting list of achievements of a non-member should fail', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/user/${userId4}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting list of achievements of another user in a course', async () => {
  await obtainAchievement(userToken2, goldCode);
  await obtainAchievement(userToken2, bronzeCode);
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/user/${userId2}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(2);
  expect(res.body).toContainEqual({
    achievementCode: goldCode,
    achievementName: 'G',
    type: 'Gold',
  });
  expect(res.body).toContainEqual({
    achievementCode: bronzeCode,
    achievementName: 'B',
    type: 'Bronze',
  });
});

test('Creating a achievement while unauthenticated should fail', async () => {
  const res = await request(server).post(`/api/leaderboard/${courseId}/achievements`);
  expect(res.statusCode).toBe(401);
});

test('Creating a achievement in a non-existent course should fail', async () => {
  const res = await request(server)
    .post('/api/leaderboard/2000/achievements')
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Creating a achievement as a non-educator should fail', async () => {
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Creating a achievement as an educator', async () => {
  const res1 = await request(server)
    .post(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken1)
    .send({
      achievementName: 'a new achievement',
      type: 'Bronze',
    });
  expect(res1.statusCode).toBe(200);
  const code = res1.body.achievementCode;

  // Check that the new achievement exists
  const res2 = await request(server)
    .get(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken1);
  expect(res2.body).toContainEqual({
    achievementName: 'a new achievement',
    achievementCode: code,
    type: 'Bronze',
  });
});

test('Getting all achievements of a course while unauthenticated should fail', async () => {
  const res = await request(server).get(`/api/leaderboard/${courseId}/achievements`);
  expect(res.statusCode).toBe(401);
});

test('Getting all achievements of a non-existent course should fail', async () => {
  const res = await request(server)
    .get('/api/leaderboard/2000/achievements')
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Getting all achievements of a course as a non-educator should fail', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken3);
  expect(res.statusCode).toBe(403);
});

test('Getting all achievements of a course as an educator', async () => {
  const res = await request(server)
    .get(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveLength(3);
  expect(res.body).toContainEqual({
    achievementCode: goldCode,
    achievementName: 'G',
    type: 'Gold',
  });
  expect(res.body).toContainEqual({
    achievementCode: silverCode,
    achievementName: 'S',
    type: 'Silver',
  });
  expect(res.body).toContainEqual({
    achievementCode: bronzeCode,
    achievementName: 'B',
    type: 'Bronze',
  });
});

test('Redeeming a achievement code while unauthenticated should fail', async () => {
  const res = await request(server).post(`/api/leaderboard/${courseId}/code`);
  expect(res.statusCode).toBe(401);
});

test('Redeeming a achievement code for a non-existent course should fail', async () => {
  const res = await request(server)
    .post('/api/leaderboard/2000/code')
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(404);
});

test('Redeeming a achievement code as a non-member should fail', async () => {
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/code`)
    .set('authorization', userToken4);
  expect(res.statusCode).toBe(403);
});

test('Redeeming a non-existent achievement code should fail', async () => {
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/code`)
    .set('authorization', userToken2)
    .send({
      achievementCode: invalidCode,
    });
  expect(res.statusCode).toBe(404);
});

test('Redeeming an unowned achievement', async () => {
  const res1 = await request(server)
    .post(`/api/leaderboard/${courseId}/code`)
    .set('authorization', userToken2)
    .send({
      achievementCode: silverCode,
    });
  expect(res1.statusCode).toBe(200);

  // Check that the achievement has been redeemed
  const res2 = await request(server)
    .get(`/api/leaderboard/${courseId}/user`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual([
    { achievementCode: silverCode, achievementName: 'S', type: 'Silver' },
  ]);
});

test('Redeeming the same achievement twice should fail', async () => {
  await request(server)
    .post(`/api/leaderboard/${courseId}/code`)
    .set('authorization', userToken2)
    .send({
      achievementCode: silverCode,
    });
  const res1 = await request(server)
    .post(`/api/leaderboard/${courseId}/code`)
    .set('authorization', userToken2)
    .send({
      achievementCode: silverCode,
    });
  expect(res1.statusCode).toBe(403);
});

test('Awarding a achievement to a student while unauthenticated should fail', async () => {
  const res = await request(server).post(`/api/leaderboard/${courseId}/award`);
  expect(res.statusCode).toBe(401);
});

test('Awarding a achievement to a student in a non-existent course should fail', async () => {
  const res = await request(server)
    .post('/api/leaderboard/2000/award')
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Awarding a achievement to a student as a non-educator should fail', async () => {
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/award`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Awarding a achievement to a non-existent student should fail', async () => {
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/award`)
    .set('authorization', userToken1)
    .send({
      email: 'nope@toodles.com',
      achievementCode: goldCode,
    });
  expect(res.statusCode).toBe(404);
});

test('Awarding a achievement to a non-member should fail', async () => {
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/award`)
    .set('authorization', userToken1)
    .send({
      email: 'nm@toodles.com',
      achievementCode: goldCode,
    });
  expect(res.statusCode).toBe(404);
});

test('Awarding a non-existent achievement to a should fail', async () => {
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/award`)
    .set('authorization', userToken1)
    .send({
      email: 's1@toodles.com',
      achievementCode: invalidCode,
    });
  expect(res.statusCode).toBe(404);
});

test('Awarding a achievement to someone who already owns it should fail', async () => {
  await obtainAchievement(userToken2, goldCode);
  const res = await request(server)
    .post(`/api/leaderboard/${courseId}/award`)
    .set('authorization', userToken1)
    .send({
      email: 's1@toodles.com',
      achievementCode: goldCode,
    });
  expect(res.statusCode).toBe(403);
});

test('Awarding a new achievement to someone', async () => {
  const res1 = await request(server)
    .post(`/api/leaderboard/${courseId}/award`)
    .set('authorization', userToken1)
    .send({
      email: 's1@toodles.com',
      achievementCode: goldCode,
    });
  expect(res1.statusCode).toBe(200);

  // Check that the achievement was awarded
  const res2 = await request(server)
    .get(`/api/leaderboard/${courseId}/user`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual([{ achievementCode: goldCode, achievementName: 'G', type: 'Gold' }]);
});

test('Updating a achievement while unauthenticated should fail', async () => {
  const res = await request(server).put(`/api/leaderboard/${courseId}/achievements/${goldCode}`);
  expect(res.statusCode).toBe(401);
});

test('Updating a achievement in a non-existent course should fail', async () => {
  const res = await request(server)
    .put(`/api/leaderboard/2000/achievements/${goldCode}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Updating a achievement as a non-educator should fail', async () => {
  const res = await request(server)
    .put(`/api/leaderboard/${courseId}/achievements/${goldCode}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Updating a non-existent achievement should fail', async () => {
  const res = await request(server)
    .put(`/api/leaderboard/${courseId}/achievements/${invalidCode}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Updating a achievement', async () => {
  const res1 = await request(server)
    .put(`/api/leaderboard/${courseId}/achievements/${goldCode}`)
    .set('authorization', userToken1)
    .send({
      achievementName: 'new name',
      type: 'Bronze',
    });
  expect(res1.statusCode).toBe(200);

  // Check that achievement was updated
  const res2 = await request(server)
    .get(`/api/leaderboard/${courseId}/achievements`)
    .set('authorization', userToken1);
  expect(res2.body).toContainEqual({
    achievementCode: goldCode,
    achievementName: 'new name',
    type: 'Bronze',
  });
});

test('Updating a achievement does not change ownerships, but changes ranks', async () => {
  await obtainAchievement(userToken2, goldCode);
  await obtainAchievement(userToken3, silverCode);

  // Change gold achievement to bronze
  const res1 = await request(server)
    .put(`/api/leaderboard/${courseId}/achievements/${goldCode}`)
    .set('authorization', userToken1)
    .send({
      achievementName: 'gold -> bronze',
      type: 'Bronze',
    });
  expect(res1.statusCode).toBe(200);

  // Check that user with gold achievement now has the updated achievement
  const res2 = await request(server)
    .get(`/api/leaderboard/${courseId}/user`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual([
    { achievementCode: goldCode, achievementName: 'gold -> bronze', type: 'Bronze' },
  ]);

  // Check that rankings have changed
  const res3 = await request(server)
    .get(`/api/leaderboard/${courseId}/overview`)
    .set('authorization', userToken1);
  expect(res3.body).toEqual([
    {
      rank: 1,
      userId: userId3,
      firstName: 'Student',
      lastName: 'Two',
      email: 's2@toodles.com',
      gold: 0,
      silver: 1,
      bronze: 0,
    },
    {
      rank: 2,
      userId: userId2,
      firstName: 'Student',
      lastName: 'One',
      email: 's1@toodles.com',
      gold: 0,
      silver: 0,
      bronze: 1,
    },
  ]);
});

test('Deleting a achievement while unauthenticated should fail', async () => {
  const res = await request(server).delete(`/api/leaderboard/${courseId}/achievements/${goldCode}`);
  expect(res.statusCode).toBe(401);
});

test('Deleting a achievement in a non-existent course should fail', async () => {
  const res = await request(server)
    .delete(`/api/leaderboard/2000/achievements/${goldCode}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Deleting a achievement as a non-educator should fail', async () => {
  const res = await request(server)
    .delete(`/api/leaderboard/${courseId}/achievements/${goldCode}`)
    .set('authorization', userToken2);
  expect(res.statusCode).toBe(403);
});

test('Deleting a non-existent achievement should fail', async () => {
  const res = await request(server)
    .delete(`/api/leaderboard/${courseId}/achievements/${invalidCode}`)
    .set('authorization', userToken1);
  expect(res.statusCode).toBe(404);
});

test('Deleting a achievement', async () => {
  const res1 = await request(server)
    .delete(`/api/leaderboard/${courseId}/achievements/${goldCode}`)
    .set('authorization', userToken1);
  expect(res1.statusCode).toBe(200);

  // Check that the achievement was actually deleted by trying to redeem it
  const res2 = await request(server)
    .post(`/api/leaderboard/${courseId}/code`)
    .set('authorization', userToken2)
    .send({
      achievementCode: goldCode,
    });
  expect(res2.statusCode).toBe(404);
});

test('Deleting a achievement affects ownerships and ranks', async () => {
  await obtainAchievement(userToken2, goldCode);
  await obtainAchievement(userToken3, silverCode);

  const res1 = await request(server)
    .delete(`/api/leaderboard/${courseId}/achievements/${goldCode}`)
    .set('authorization', userToken1);
  expect(res1.statusCode).toBe(200);

  // Check that the gold achievement owner does not own it anymore
  const res2 = await request(server)
    .get(`/api/leaderboard/${courseId}/user`)
    .set('authorization', userToken2);
  expect(res2.body).toEqual([]);

  // Check that rankings have changed
  const res3 = await request(server)
    .get(`/api/leaderboard/${courseId}/overview`)
    .set('authorization', userToken1);
  expect(res3.body).toEqual([
    {
      rank: 1,
      userId: userId3,
      firstName: 'Student',
      lastName: 'Two',
      email: 's2@toodles.com',
      gold: 0,
      silver: 1,
      bronze: 0,
    },
    {
      rank: 2,
      userId: userId2,
      firstName: 'Student',
      lastName: 'One',
      email: 's1@toodles.com',
      gold: 0,
      silver: 0,
      bronze: 0,
    },
  ]);
});
