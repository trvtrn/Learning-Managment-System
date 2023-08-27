const {
  isUserEnrolledIn,
  isUserEducatorOf,
  getCourseForPost,
  addReply,
  getReply,
  updateReply,
  deleteReply,
  getCourseForReply,
  isUserCreatorOfReply,
  doesReplyExist,
  doesPostExist,
} = require('../scripts/database');

const createReplyHandler = (req, res) => {
  const userId = req.userId;

  const postId = parseInt(req.body.postId);
  if (!doesPostExist(postId)) {
    return res.status(404).send({ message: `Post with id ${postId} not found` });
  }
  const text = req.body.text;
  if (!isUserEnrolledIn(userId, getCourseForPost(postId))) {
    return res.status(403).send({ message: `You cannot reply to post with id ${postId}` });
  }
  res.send({ replyId: addReply(userId, postId, text, req.files) });
};

const getReplyHandler = (req, res) => {
  const userId = req.userId;

  const replyId = parseInt(req.params.replyId);
  if (!doesReplyExist(replyId)) {
    return res.status(404).send({ message: `Reply with id ${replyId} not found` });
  }
  if (!isUserEnrolledIn(userId, getCourseForReply(replyId))) {
    return res.status(403).send({ message: `You cannot read the reply with id ${replyId}` });
  }
  res.send(getReply(replyId));
};

const updateReplyHandler = (req, res) => {
  const userId = req.userId;

  const replyId = parseInt(req.body.replyId);
  if (!doesReplyExist(replyId)) {
    return res.status(404).send({ message: `Reply with id ${replyId} not found` });
  }

  const text = req.body.text;
  if (
    !isUserEducatorOf(userId, getCourseForReply(replyId)) &&
    !isUserCreatorOfReply(userId, replyId)
  ) {
    return res.status(403).send({ message: `You cannot edit the reply with id ${replyId}` });
  }
  updateReply(replyId, text, req.files);
  res.send({ message: 'Reply successfully updated' });
};

const deleteReplyHandler = (req, res) => {
  const userId = req.userId;

  const replyId = parseInt(req.params.replyId);
  if (!doesReplyExist(replyId)) {
    return res.status(404).send({ message: `Reply with id ${replyId} not found` });
  }

  if (
    !isUserEducatorOf(userId, getCourseForReply(replyId)) &&
    !isUserCreatorOfReply(userId, replyId)
  ) {
    return res.status(403).send({ message: `You cannot delete the reply with id ${replyId}` });
  }
  deleteReply(replyId);
  res.send({ message: 'Reply successfully deleted' });
};

module.exports = {
  createReplyHandler,
  getReplyHandler,
  updateReplyHandler,
  deleteReplyHandler,
};
