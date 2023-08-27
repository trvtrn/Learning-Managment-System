const {
  getCourse,
  deleteCourse,
  addCourse,
  getAllCoursesForUser,
  isUserCreatorOf,
  doesCourseExist,
  getIdOfUserWithEmail,
  updateCourse,
} = require('../scripts/database');

/**
 * Handler for GET /api/courses route
 */
const getAllCoursesHandler = async (req, res) => {
  const userId = req.userId;
  res.send(getAllCoursesForUser(userId));
};

/**
 * Handler for POST /api/courses route
 */
const addCourseHandler = async (req, res) => {
  const userId = req.userId;

  if (req.body.members.some(({ email }) => getIdOfUserWithEmail(email) === undefined)) {
    res.status(404).send({ message: 'At least one of the users to be added does not exist' });
  } else {
    res.send({ courseId: addCourse(req.body.courseName, req.body.members, userId) });
  }
};

/**
 * Handler for DELETE /api/courses route
 */
const updateCourseHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserCreatorOf(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    updateCourse(courseId, req.body.courseName);
    res.send({ message: 'Successfully updated course name' });
  }
};

/**
 * Handler for DELETE /api/courses route
 */
const deleteCourseHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserCreatorOf(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    deleteCourse(courseId);
    res.send({ message: 'Successfully deleted course' });
  }
};

const getCourseHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else {
    res.send(getCourse(req.params.courseId));
  }
};

module.exports = {
  getAllCoursesHandler,
  addCourseHandler,
  deleteCourseHandler,
  getCourseHandler,
  updateCourseHandler,
};
