const Database = require('better-sqlite3');

const { getClasses, doesCourseExist, isUserEnrolledIn } = require('../scripts/database');

/**
 * Handler for GET /api/classes route
 */
const getClassesHandler = (req, res) => {
  const userId = req.userId;

  if (!doesCourseExist(parseInt(req.params.courseId))) {
    res.status(404).send({ message: `Course with id ${req.params.courseId} not found` });
  } else if (!isUserEnrolledIn(userId, parseInt(req.params.courseId))) {
    res.status(403).send({ message: `You do not have permission to access this course` });
  } else {
    res.send(getClasses(parseInt(req.params.courseId)));
  }
};

module.exports = {
  getClassesHandler,
};
