const { isUserEnrolledIn, getPosts } = require('../scripts/database');

const getPostsHandler = (req, res) => {
  const userId = req.userId;

  if (!isUserEnrolledIn(userId, req.params.courseId)) {
    return res.status(403).send({
      message: `You do not have permission to fetch posts for course with id ${req.params.courseId}`,
    });
  }
  return res.send(getPosts(parseInt(req.params.courseId)));
};
module.exports = { getPostsHandler };
