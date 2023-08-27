const {
  getCategories,
  updateCategories,
  areAllCategoriesInCourse,
  isUserEnrolledIn,
  isUserEducatorOf,
} = require('../scripts/database');

const getCategoriesHandler = (req, res) => {
  const { userId } = req;
  const courseId = parseInt(req.params.courseId);
  if (!isUserEnrolledIn(userId, courseId)) {
    return res.status(403).send({
      message: `You do not have permission to see forum categories in course with id ${courseId}`,
    });
  }
  return res.send(getCategories(courseId));
};

const updateCategoriesHandler = (req, res) => {
  const userId = req.userId;

  const { courseId, categories } = req.body;
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({
      message: `You do not have permission to change forum categories in course with id ${courseId}`,
    });
  }

  if (
    !areAllCategoriesInCourse(
      categories.map((category) => category.categoryId).filter(Number),
      courseId
    )
  ) {
    return res.status(404).send({
      message: `One of the forum categories not found in course with id ${courseId}`,
    });
  }

  updateCategories(courseId, categories);
  res.send({ message: 'Categories successfully updated' });
};

module.exports = {
  getCategoriesHandler,
  updateCategoriesHandler,
};
