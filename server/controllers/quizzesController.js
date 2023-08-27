const {
  doesCourseExist,
  isUserEnrolledIn,
  getAllQuizzesForCourse,
} = require('../scripts/database');

const getAllQuizzesHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getAllQuizzesForCourse(courseId));
  }
};

module.exports = {
  getAllQuizzesHandler,
};
