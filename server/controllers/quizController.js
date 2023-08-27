const {
  doesQuizExist,
  getCourseContainingQuiz,
  makeQuizSubmission,
  canUserSubmitQuiz,
  canUserAccessMarks,
  canUserMarkSubmission,
  getQuizDetails,
  addQuizToCourse,
  removeQuiz,
  getAllQuestionsInQuiz,
  getAllSubmissionsForQuiz,
  getQuizSubmissionAnswers,
  getMarksForQuizSubmission,
  markQuizSubmission,
  updateQuizDetails,
  doesCourseExist,
  isUserEnrolledIn,
  isUserEducatorOf,
  setMarksReleased,
  hasUserStartedQuiz,
  doesUserExist,
  canUserStartQuiz,
  startQuizSubmission,
  canUserAccessQuizAnswers,
} = require('../scripts/database');

/**
 * Handler for GET /api/quiz/:quizId route
 */
const getQuizHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!isUserEnrolledIn(userId, getCourseContainingQuiz(quizId))) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    const isEducator = isUserEducatorOf(userId, getCourseContainingQuiz(quizId));
    res.send({
      ...getQuizDetails(quizId),
      questions: getAllQuestionsInQuiz(
        quizId,
        isEducator || hasUserStartedQuiz(userId, quizId),
        isEducator || canUserAccessQuizAnswers(userId, quizId)
      ),
    });
  }
};

/**
 * Handler for POST /api/quiz route
 */
const addQuizHandler = (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  if (!doesCourseExist(courseId)) {
    res.status(404).send({ message: `course with ID ${courseId} does not exist` });
  } else if (!isUserEducatorOf(userId, courseId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send({
      quizId: addQuizToCourse(
        courseId,
        req.body.name,
        req.body.description,
        req.body.releaseDate,
        req.body.dueDate,
        req.body.duration,
        req.body.weighting,
        req.body.questions || []
      ),
    });
  }
};

/**
 * Handler for PUT /api/quiz route
 */
const updateQuizHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.body.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!isUserEducatorOf(userId, getCourseContainingQuiz(quizId))) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    updateQuizDetails(
      quizId,
      req.body.name,
      req.body.description,
      req.body.releaseDate,
      req.body.dueDate,
      req.body.duration,
      req.body.weighting,
      req.body.questions || []
    );
    res.send({ message: `successfully updated quiz with ID ${quizId}` });
  }
};

/**
 * Handler for DELETE /api/quiz/:quizId route
 */
const deleteQuizHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!isUserEducatorOf(userId, getCourseContainingQuiz(quizId))) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    removeQuiz(quizId);
    res.send({ message: `successfully deleted quiz with ID ${quizId}` });
  }
};

/**
 * Handler for GET /api/quiz/:quizId/submissions route
 */
const getAllQuizSubmissionsHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!isUserEducatorOf(userId, getCourseContainingQuiz(quizId))) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getAllSubmissionsForQuiz(quizId));
  }
};

/**
 * Handler for GET /api/quiz/:quizId/submission route
 */
const getSubmissionHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!isUserEnrolledIn(userId, getCourseContainingQuiz(quizId))) {
    res.status(403).send({ message: 'unauthorised' });
  } else if (!hasUserStartedQuiz(userId, quizId)) {
    res
      .status(404)
      .send({ message: `user with ID ${userId} has not attempted quiz with ID ${quizId}` });
  } else {
    res.send(getQuizSubmissionAnswers(quizId, userId));
  }
};

/**
 * Handler for GET /api/quiz/:quizId/submission/:userId route
 */
const getSubmissionOfUserHandler = (req, res) => {
  const requesterId = req.userId;
  const quizId = req.params.quizId;
  const userId = req.params.userId;

  if (requesterId === -1) {
    res.status(403).send({ message: 'unauthenticated' });
  } else if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!doesUserExist(userId)) {
    res.status(404).send({ message: `user with ID ${userId} does not exist` });
  } else if (!hasUserStartedQuiz(userId, quizId)) {
    res
      .status(404)
      .send({ message: `user with ID ${userId} has not attempted quiz with ID ${quizId}` });
  } else if (!isUserEducatorOf(requesterId, getCourseContainingQuiz(quizId))) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getQuizSubmissionAnswers(quizId, userId));
  }
};

/**
 * Handler for POST /api/quiz/:quizId/submission route
 */
const startQuizSubmissionHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!canUserStartQuiz(userId, quizId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send({ startTime: startQuizSubmission(userId, quizId) });
  }
};

/**
 * Handler for PUT /api/quiz/:quizId/submission route
 */
const makeSubmissionHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!isUserEnrolledIn(userId, getCourseContainingQuiz(quizId))) {
    res
      .status(403)
      .send({ message: `user with ID ${userId} cannot submit quiz with ID ${quizId}` });
  } else if (!canUserSubmitQuiz(userId, quizId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    makeQuizSubmission(userId, quizId, req.body.answers);
    res.send({ message: `user with ID ${userId} successfully submitted quiz with ID ${quizId}` });
  }
};

/**
 * Handler for GET /api/quiz/:quizId/mark/ route
 */
const getOwnQuizMarksHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!hasUserStartedQuiz(userId, quizId)) {
    res
      .status(404)
      .send({ message: `user with ID ${userId} has not attempted quiz with ID ${quizId}` });
  } else if (!canUserAccessMarks(userId, quizId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getMarksForQuizSubmission(quizId, userId));
  }
};

/**
 * Handler for GET /api/quiz/:quizId/mark/ route
 */
const getQuizMarksHandler = (req, res) => {
  const requestorId = req.userId;
  const quizId = req.params.quizId;
  const userId = req.params.userId;

  if (requestorId === -1) {
    res.status(403).send({ message: 'unauthenticated' });
  } else if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!hasUserStartedQuiz(userId, quizId)) {
    res
      .status(404)
      .send({ message: `user with ID ${userId} has not attempted quiz with ID ${quizId}` });
  } else if (!canUserAccessMarks(userId, quizId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(getMarksForQuizSubmission(quizId, userId));
  }
};

/**
 * Handler for PUT /api/quiz/:quizId/mark/:userId route
 */
const markSubmissionHandler = (req, res) => {
  const markerId = req.userId;
  const quizId = req.params.quizId;
  const submitterId = req.params.userId;

  if (markerId === -1) {
    res.status(403).send({ message: 'unauthenticated' });
  } else if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!doesUserExist(submitterId)) {
    res.status(404).send({ message: `user with ID ${submitterId} does not exist` });
  } else if (!hasUserStartedQuiz(submitterId, quizId)) {
    res
      .status(404)
      .send({ message: `user with ID ${submitterId} has not attempted quiz with ID ${quizId}` });
  } else if (!canUserMarkSubmission(markerId, quizId, submitterId)) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    markQuizSubmission(markerId, quizId, submitterId, req.body.questionMarks);
    res.send({
      message: `successfully marked quiz with ID ${quizId} for user with ID ${submitterId}`,
    });
  }
};

/**
 * Handler for PUT /api/quiz/:quizId/release route
 */
const setMarksReleasedHandler = (req, res) => {
  const userId = req.userId;
  const quizId = req.params.quizId;
  const releaseMarks = req.body.releaseMarks;

  if (!doesQuizExist(quizId)) {
    res.status(404).send({ message: `quiz with ID ${quizId} does not exist` });
  } else if (!isUserEducatorOf(userId, getCourseContainingQuiz(quizId))) {
    res.status(403).send({ message: 'unauthorised' });
  } else {
    setMarksReleased(quizId, releaseMarks);
    res.send({
      message: `successfully ${releaseMarks ? '' : 'un'}released marks for quiz with ID ${quizId}`,
    });
  }
};

module.exports = {
  getQuizHandler,
  addQuizHandler,
  updateQuizHandler,
  deleteQuizHandler,
  getAllQuizSubmissionsHandler,
  getSubmissionHandler,
  getSubmissionOfUserHandler,
  startQuizSubmissionHandler,
  makeSubmissionHandler,
  getQuizMarksHandler,
  getOwnQuizMarksHandler,
  markSubmissionHandler,
  setMarksReleasedHandler,
};
