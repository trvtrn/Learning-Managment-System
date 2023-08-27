const {
  doesCourseExist,
  isUserEnrolledIn,
  getLeaderboardOverview,
  getUserAchievements,
  redeemAchievement,
  hasUserRedeemedAchievement,
  doesAchievementExist,
  isUserEducatorOf,
  getAllAchievements,
  createAchievement,
  deleteAchievement,
  updateAchievement,
  getIdOfUserWithEmail,
} = require('../scripts/database');

/**
 * Handler for GET /api/leaderboard/:courseId/overview route
 */
const getLeaderboardOverviewHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else {
    res.send(getLeaderboardOverview(courseId));
  }
};

/**
 * Handler for GET /api/leaderboard/:courseId/user route
 */
const getOwnAchievementsHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else {
    res.send(getUserAchievements(courseId, userId));
  }
};

/**
 * Handler for GET /api/leaderboard/:courseId/user/:userId route
 */
const getUserAchievementsHandler = (req, res) => {
  const requestorId = req.userId;
  const userId = req.params.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(requestorId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(404).send({ message: `user with ID ${userId} not in course with ID ${courseId}` });
  } else {
    res.send(getUserAchievements(courseId, userId));
  }
};

/**
 * Handler for POST /api/leaderboard/:courseId/code route
 */
const redeemAchievementHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;
  const code = req.body.achievementCode;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else if (!doesAchievementExist(courseId, code)) {
    res.status(404).send({ message: `Code ${code} is not valid` });
  } else if (hasUserRedeemedAchievement(courseId, userId, code)) {
    res.status(403).send({ message: `Code ${code} has already been redeemed` });
  } else {
    res.send(redeemAchievement(courseId, userId, code));
  }
};

/**
 * Handler for GET /api/leaderboard/:courseId/achievements route
 */
const getAllAchievementsHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else {
    res.send(getAllAchievements(courseId));
  }
};

/**
 * Handler for POST /api/leaderboard/:courseId/achievements route
 */
const createAchievementHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;
  const { achievementName, type } = req.body;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else {
    res.send({ achievementCode: createAchievement(courseId, achievementName, type) });
  }
};

/**
 * Handler for DELETE /api/leaderboard/:courseId/achievements/:achievementCode route
 */
const deleteAchievementHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;
  const code = req.params.achievementCode;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else if (!doesAchievementExist(courseId, code)) {
    res.status(404).send({ message: `achievement with code ${code} does not exist` });
  } else {
    deleteAchievement(courseId, code);
    res.send({
      message: `successfully deleted achievement ${code} from course with ID ${courseId}`,
    });
  }
};

/**
 * Handler for PUT /api/leaderboard/:courseId/achievements/:achievementCode route
 */
const updateAchievementHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;
  const code = req.params.achievementCode;
  const { achievementName, type } = req.body;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else if (!doesAchievementExist(courseId, code)) {
    res.status(404).send({ message: `achievement with code ${code} does not exist` });
  } else {
    updateAchievement(courseId, code, achievementName, type);
    res.send({ message: `successfully updated achievement ${code} in course with ID ${courseId}` });
  }
};

/**
 * Handler for POST /api/leaderboard/:courseId/award route
 */
const awardAchievementHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;
  const { email, achievementCode } = req.body;
  const awardeeId = getIdOfUserWithEmail(email);

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(userId, courseId)) {
    res.status(403).send({ message: `unauthorised` });
  } else if (awardeeId === undefined) {
    res.status(404).send({ message: `User with email ${email} does not exist` });
  } else if (!isUserEnrolledIn(awardeeId, courseId)) {
    res.status(404).send({ message: `User with email ${email} is not in the course` });
  } else if (isUserEducatorOf(awardeeId, courseId)) {
    res.status(404).send({ message: 'You cannot award an educator achievements' });
  } else if (!doesAchievementExist(courseId, achievementCode)) {
    res.status(404).send({ message: `Achievement with code ${achievementCode} does not exist` });
  } else if (hasUserRedeemedAchievement(courseId, awardeeId, achievementCode)) {
    res
      .status(403)
      .send({ message: `User with email ${email} already owns achievement ${achievementCode}` });
  } else {
    redeemAchievement(courseId, awardeeId, achievementCode);
    res.send({
      message: `successfully awarded achievement ${achievementCode} to user with email ${email}`,
    });
  }
};

module.exports = {
  getLeaderboardOverviewHandler,
  getOwnAchievementsHandler,
  getUserAchievementsHandler,
  redeemAchievementHandler,
  getAllAchievementsHandler,
  createAchievementHandler,
  deleteAchievementHandler,
  updateAchievementHandler,
  awardAchievementHandler,
};
