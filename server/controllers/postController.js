const path = require('path');
const {
  isUserEnrolledIn,
  isUserEducatorOf,
  getCourse,
  isCategoryInCourse,
  addPost,
  getPost,
  updatePost,
  deletePost,
  doesPostExist,
  canUserEditPost,
  getCourseForPost,
  isSelectableForStudents,
  emailAllMembersInCourse,
  getUserDetailsById,
} = require('../scripts/database');

const createPostHandler = (req, res) => {
  const userId = req.userId;

  const { title, text } = req.body;
  const courseId = parseInt(req.body.courseId);
  const categoryId = parseInt(req.body.categoryId);
  const shouldNotifyStudents =
    req.body.shouldNotifyStudents === 'true' || req.body.shouldNotifyStudents === true;

  if (!isUserEnrolledIn(userId, courseId)) {
    return res.status(403).send({
      message: `You do not have permission to write a forum post in course with id ${courseId}`,
    });
  }

  const isUserEducator = isUserEducatorOf(userId, courseId);
  if (!isUserEducator && shouldNotifyStudents) {
    return res.status(403).send({
      message: `You do not have permission to notify students in course with id ${courseId}`,
    });
  }
  if (categoryId) {
    if (!isCategoryInCourse(categoryId, courseId)) {
      return res.status(404).send({
        message: `Category with id ${categoryId} not found in course with id ${courseId}`,
      });
    }
    if (!isUserEducator && !isSelectableForStudents(categoryId)) {
      return res.status(403).send({
        message: `You do not have permission to post in category with id ${categoryId}`,
      });
    }
  }

  const postId = addPost(courseId, userId, title, categoryId, text, req.files || []);
  if (shouldNotifyStudents) {
    const user = getUserDetailsById(userId);
    const { courseName } = getCourse(courseId);
    emailAllMembersInCourse(
      courseId,
      `Announcement: ${title}`,
      {
        posterName: `${user.firstName} ${user.lastName}`,
        courseName,
        link: `${process.env.HTTP_PROTOCOL}://${process.env.DOMAIN}:${process.env.CLIENT_PORT}/${courseId}/post/${postId}`,
        isUpdate: false,
      },
      path.resolve(__dirname, '../assets/announcementNotification.handlebars')
    );
  }

  return res.send({ postId });
};

const getPostHandler = (req, res) => {
  const userId = req.userId;

  const postId = parseInt(req.params.postId);
  if (!doesPostExist(postId)) {
    return res.status(404).send({ message: `Post with id ${postId} not found` });
  }

  const courseId = getCourseForPost(postId);
  if (!isUserEnrolledIn(userId, courseId)) {
    return res
      .status(403)
      .send({ message: `You do not have permission to access post with id ${postId}` });
  }

  return res.send(getPost(postId));
};

const updatePostHandler = (req, res) => {
  const userId = req.userId;

  const { title, text } = req.body;
  const postId = parseInt(req.body.postId);
  const categoryId = parseInt(req.body.categoryId);
  const shouldNotifyStudents =
    req.body.shouldNotifyStudents === 'true' || req.body.shouldNotifyStudents === true;

  if (!doesPostExist(postId)) {
    return res.status(404).send({ message: `Post with id ${postId} not found` });
  }

  if (!canUserEditPost(userId, postId)) {
    return res
      .status(403)
      .send({ message: `You do not have permission to edit post with id ${postId}` });
  }

  const courseId = getCourseForPost(postId);
  const isUserEducator = isUserEducatorOf(userId, courseId);
  if (shouldNotifyStudents && !isUserEducator) {
    return res.status(403).send({
      message: `You do not have permission to notify students in course with id ${courseId}`,
    });
  }

  if (categoryId) {
    if (!isCategoryInCourse(categoryId, courseId)) {
      return res.status(404).send({
        message: `Category with id ${categoryId} not found in course with id ${courseId}`,
      });
    }

    if (!isUserEducator && !isSelectableForStudents(categoryId)) {
      return res.status(403).send({
        message: `You cannot post in category with id ${categoryId}`,
      });
    }
  }

  if (shouldNotifyStudents) {
    const user = getUserDetailsById(userId);
    const { courseName } = getCourse(courseId);
    emailAllMembersInCourse(
      courseId,
      `Announcement Update: ${title}`,
      {
        posterName: `${user.firstName} ${user.lastName}`,
        courseName,
        link: `${process.env.HTTP_PROTOCOL}://${process.env.DOMAIN}:${process.env.CLIENT_PORT}/${courseId}/post/${postId}`,
        isUpdate: true,
      },
      path.resolve(__dirname, '../assets/announcementNotification.handlebars')
    );
  }

  updatePost(postId, title, categoryId, text, req.files || []);
  res.send({ message: 'Post successfully updated' });
};

const deletePostHandler = (req, res) => {
  const userId = req.userId;

  const postId = parseInt(req.params.postId);
  if (!doesPostExist(postId)) {
    return res.status(404).send({ message: `Post with id ${postId} not found` });
  }

  if (!canUserEditPost(userId, postId)) {
    return res
      .status(403)
      .send({ message: `You do not have permission to delete post with id ${postId}` });
  }

  deletePost(postId);
  res.status(200).send({ message: 'Post successfully deleted' });
};

module.exports = {
  createPostHandler,
  getPostHandler,
  updatePostHandler,
  deletePostHandler,
};
