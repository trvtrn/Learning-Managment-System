const {
  getIdOfUserWithEmail,
  addMembersToCourse,
  doesCourseExist,
  isUserEnrolledIn,
  isUserCreatorOf,
  getAllMembersOfCourse,
} = require('../scripts/database');

/**
 * Handler for GET /api/members/:courseId route
 */
const getAllMembersOfCourseHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getAllMembersOfCourse(courseId));
  }
};

/**
 * Handler for POST /api/members route
 */
const addCourseMembersHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserCreatorOf(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else if (req.body.members.some(({ email }) => getIdOfUserWithEmail(email) === undefined)) {
    res.status(404).send({ message: 'At least one of the users to be added does not exist' });
  } else {
    addMembersToCourse(courseId, req.body.members);
    res.send({ message: `Successfully added members to course with ID ${courseId}` });
  }
};

module.exports = {
  getAllMembersOfCourseHandler,
  addCourseMembersHandler,
};
