const {
  doesUserExist,
  doesCourseExist,
  isUserEnrolledIn,
  isUserCreatorOf,
  deleteMemberFromCourse,
  updateUserRoleInCourse,
  getMemberRoleInCourse,
} = require('../scripts/database');

/**
 * Handler for DELETE /api/member/:courseId/:userId route
 */
const deleteMemberHandler = async (req, res) => {
  const requesterId = req.userId;
  const userId = parseInt(req.params.userId);
  const courseId = req.params.courseId;

  if (requesterId === -1) {
    res.status(403).send({ message: 'unauthenticated' });
  } else if (!doesUserExist(userId)) {
    res.status(404).send({ message: `user with ID ${userId} does not exist` });
  } else if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserCreatorOf(requesterId, courseId) && userId !== requesterId) {
    res.status(403).send({ message: 'unauthorised' });
  } else if (isUserCreatorOf(userId, courseId)) {
    res.status(403).send({ message: 'A creator cannot be deleted from a course' });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(404).send({ message: `user with ID ${userId} not in course with ID ${courseId}` });
  } else {
    deleteMemberFromCourse(courseId, userId);
    res.send({ message: `Deleted user with ID ${userId} from course with ID ${courseId}` });
  }
};

/**
 * Handler for GET /api/member/:courseId route
 */
const getMemberRoleHandler = async (req, res) => {
  const requesterId = req.userId;
  const courseId = req.params.courseId;

  if (requesterId === -1) {
    res.status(403).send({ message: 'unauthenticated' });
  } else if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist ` });
  } else if (!isUserEnrolledIn(requesterId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send({ role: getMemberRoleInCourse(courseId, requesterId) });
  }
};

/**
 * Handler for PUT /api/member route
 */
const updateMemberRoleHandler = async (req, res) => {
  const requesterId = req.userId;
  const userId = req.body.userId;
  const courseId = req.body.courseId;

  if (requesterId === -1) {
    res.status(403).send({ message: 'unauthenticated' });
  } else if (!doesUserExist(userId)) {
    res.status(404).send({ message: `user with ID ${userId} does not exist ` });
  } else if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist ` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(404).send({ message: `user with ID ${userId} not in course with ID ${courseId}` });
  } else if (!isUserCreatorOf(requesterId, courseId) || isUserCreatorOf(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    updateUserRoleInCourse(courseId, userId, req.body.role);
    res.send(`Successfully updated role of user with ID ${userId} in course with ID ${courseId}`);
  }
};

module.exports = {
  deleteMemberHandler,
  getMemberRoleHandler,
  updateMemberRoleHandler,
};
