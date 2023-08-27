const {
  getAllTeachingMaterials,
  doesCourseExist,
  isUserEnrolledIn,
} = require('../scripts/database');

/**
 * Handler for GET /api/materials/:courseId route
 */
const getAllMaterialsForCourseHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEnrolledIn(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getAllTeachingMaterials(courseId));
  }
};

module.exports = {
  getAllMaterialsForCourseHandler,
};
