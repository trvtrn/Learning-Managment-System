const Database = require('better-sqlite3');
const {
  doesUserExist,
  doesCourseExist,
  isUserEducatorOf,
  isUserEnrolledIn,
  createAssignment,
  updateAssignment,
  doesAssignmentExist,
  submitAssignment,
  getAssignmentsOverviewForCourse,
  releaseMarks,
  getAssignment,
  getAssignmentCourseId,
  getAssignmentSubmission,
  deleteAssignment,
  getAllSubmissionsForAssignment,
  doesAssignmentSubmissionExist,
  getSubmissionCourseId,
  markAssignment,
  doesUserSubmissionExistForAssignment,
  isAssignmentPastDeadline,
} = require('../scripts/database');

/**
 * Handler for POST /api/assignment/ route
 */
const createAssignmentHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  if (!doesCourseExist(courseId)) {
    return res.status(404).send({ message: 'invalid course ID' });
  } else if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'unauthorised' });
  } else {
    res.send(
      createAssignment(
        parseInt(req.body.courseId),
        req.body.assignmentName,
        req.body.description,
        parseInt(req.body.releaseDate),
        parseInt(req.body.dueDate),
        parseInt(req.body.totalMarks),
        req.files === undefined ? [] : req.files,
        req.body.weighting
      )
    );
  }
};

/**
 * Handler for PUT /api/assignment/ route
 */
const updateAssignmentHandler = async (req, res) => {
  const userId = req.userId;
  const assignmentId = req.body.assignmentId;

  if (!doesAssignmentExist(assignmentId)) {
    return res.status(404).send({ message: 'invalid assignment ID' });
  }

  // Get courseId from assignment
  const courseId = getAssignmentCourseId(assignmentId);

  if (!doesCourseExist(courseId)) {
    return res.status(404).send({ message: 'invalid course ID' });
  } else if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'unauthorised' });
  } else {
    updateAssignment(
      parseInt(req.body.assignmentId),
      req.body.assignmentName,
      req.body.description,
      parseInt(req.body.releaseDate),
      parseInt(req.body.dueDate),
      parseInt(req.body.totalMarks),
      req.files === undefined ? [] : req.files,
      req.body.weighting
    );

    return res.send({ message: 'Assignment successfully updated' });
  }
};

/**
 * Handler for GET /api/assignment/:assignmentId route
 */
const getAssignmentHandler = async (req, res) => {
  const userId = req.userId;
  const assignmentId = req.params.assignmentId;

  if (!doesAssignmentExist(assignmentId)) {
    return res.status(404).send({ message: 'invalid assignment ID' });
  }

  const courseId = getAssignmentCourseId(assignmentId);
  if (!isUserEnrolledIn(userId, courseId)) {
    return res.status(403).send({ message: 'user not enrolled in course' });
  }

  res.send(getAssignment(assignmentId));
};

/**
 * Handler for GET /api/assignment/all/:courseId route
 */
const getAssignmentsOverviewForCourseHandler = async (req, res) => {
  const userId = req.userId;
  const courseId = req.params.courseId;

  if (!doesCourseExist(courseId)) {
    return res.status(404).send({ message: 'invalid course ID' });
  }

  res.send(getAssignmentsOverviewForCourse(courseId));
};

/**
 * Handler for PUT /api/assignment/submission route
 */
const submitAssignmentHandler = async (req, res) => {
  const userId = req.userId;
  const assignmentId = req.body.assignmentId;

  if (!doesAssignmentExist(assignmentId)) {
    return res.status(404).send({ message: 'invalid assignment ID' });
  }

  const courseId = getAssignmentCourseId(assignmentId);
  if (!isUserEnrolledIn(userId, courseId)) {
    return res.status(403).send({ message: 'user not enrolled in course' });
  }

  if (isAssignmentPastDeadline(assignmentId)) {
    return res
      .status(403)
      .send({ message: `assignment with id ${assignmentId} is past its deadline` });
  }

  res.send(submitAssignment(userId, assignmentId, req.files === undefined ? [] : req.files));
};

/**
 * Handler for GET /api/assignment/:assignmentId/submission/:studentId route
 */
const getAssignmentSubmissionHandler = async (req, res) => {
  const userId = req.userId;
  const assignmentId = parseInt(req.params.assignmentId);
  const studentId = parseInt(req.params.studentId);

  if (!doesAssignmentExist(assignmentId)) {
    return res.status(404).send({ message: 'invalid assignment ID' });
  } else if (!doesUserExist(studentId)) {
    return res.status(404).send({ message: 'invalid student ID' });
  }

  const courseId = getAssignmentCourseId(assignmentId);

  if (userId !== studentId && !isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'unauthorised' });
  } else if (!doesUserSubmissionExistForAssignment(studentId, assignmentId)) {
    return res.status(404).send({
      message: `User with id ${studentId} does not have a submission for assignment with id ${assignmentId}`,
    });
  }

  res.send(getAssignmentSubmission(studentId, assignmentId));
};

/**
 * Handler for PUT /api/assignment/mark route
 */
const markAssignmentHandler = async (req, res) => {
  const userId = req.userId;
  const submissionId = req.body.submissionId;

  if (!doesAssignmentSubmissionExist(submissionId)) {
    return res.status(404).send({ message: 'invalid submission ID' });
  }

  const courseId = getSubmissionCourseId(submissionId);
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'unauthorised' });
  }

  res.send(markAssignment(req.body.mark, req.body.comment, userId, submissionId));
};

/**
 * Handler for PUT /api/assignment/release route
 */
const releaseMarksHandler = async (req, res) => {
  const userId = req.userId;
  const shouldReleaseMarks = req.body.releaseMarks;
  const assignmentId = req.body.assignmentId;

  if (!doesAssignmentExist(assignmentId)) {
    return res.status(404).send({ message: 'invalid assignment ID' });
  }

  const courseId = getAssignmentCourseId(assignmentId);
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'unauthorised' });
  }

  res.send(releaseMarks(assignmentId, shouldReleaseMarks));
};

/**
 * Handler for GET /api/assignment/submissions/:assignmentId route
 */
const getAllSubmissionsForAssignmentHandler = async (req, res) => {
  const userId = req.userId;
  const assignmentId = req.params.assignmentId;

  if (!doesAssignmentExist(assignmentId)) {
    return res.status(404).send({ message: 'invalid assignment ID' });
  }

  const courseId = getAssignmentCourseId(assignmentId);
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'unauthorised' });
  }

  res.send(getAllSubmissionsForAssignment(assignmentId));
};

/**
 * Handler for DELETE /api/assignment/:assignmentId route
 */
const deleteAssignmentHandler = async (req, res) => {
  const userId = req.userId;
  const assignmentId = req.params.assignmentId;

  if (!doesAssignmentExist(assignmentId)) {
    return res.status(404).send({ message: 'invalid assignment ID' });
  }

  const courseId = getAssignmentCourseId(assignmentId);
  if (!isUserEducatorOf(userId, courseId)) {
    return res.status(403).send({ message: 'unauthorised' });
  }

  res.send(deleteAssignment(assignmentId));
};

module.exports = {
  createAssignmentHandler,
  getAssignmentHandler,
  getAssignmentsOverviewForCourseHandler,
  updateAssignmentHandler,
  submitAssignmentHandler,
  getAssignmentSubmissionHandler,
  markAssignmentHandler,
  releaseMarksHandler,
  getAllSubmissionsForAssignmentHandler,
  deleteAssignmentHandler,
};
