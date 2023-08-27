const express = require('express');
const multer = require('multer');
const assignmentController = require('../controllers/assignmentController');
const { STORAGE } = require('../utils/constants');
const { authenticate } = require('../utils/helpers');

const router = express.Router();

/**
 * Create a new assignment for a course
 * Inputs:
 * - courseId: number
 * - assignmentName: string
 * - releaseDate: number (unix time)
 * - dueDate: number (unix time)
 * - totalMarks: number
 * - description: string
 * - files: list of (name, blob) pairs
 * - weighting: number between 0-100
 * Outputs:
 * - assignmentId: number
 */
router.post(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  assignmentController.createAssignmentHandler
);

/**
 * Updates an assignment for a course
 * Inputs:
 * - assignmentId: number
 * - assignmentName: string
 * - releaseDate: number (unix time)
 * - dueDate: number (unix time)
 * - totalMarks: number
 * - description: string
 * - files: list of (name, blob) pairs
 * - weighting: number between 0-100
 * Outputs:
 * - N/A
 */
router.put(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  assignmentController.updateAssignmentHandler
);

/**
 * Gets all information for an assignmentID
 * Inputs:
 * - assignmentId: number
 * Outputs:
 * - assignmentName: string
 * - dueDate: number (unix time)
 * - totalMarks: number
 * - description: string
 * - files: list of (name, blob) pairs
 * - weighting: number between 0-100
 * - releaseDate: integer in unix time
 * - marksReleased: boolean
 */
router.get('/:assignmentId', authenticate, assignmentController.getAssignmentHandler);

/**
 * Gets overview information for all assignments in the course
 * Inputs:
 * - courseId: number
 * Outputs:
 * - [{assignmentId, name, dueDate, releaseDate}, …]: list containing the following for each course
 * - assignmentId: number
 * - assignmentName: string
 * - dueDate: number (unix time)
 * - releaseDate: number (unix time)
 */
router.get(
  '/all/:courseId',
  authenticate,
  assignmentController.getAssignmentsOverviewForCourseHandler
);

/**
 * Allows a student to submit an assignment
 * Inputs:
 * - assignmentId: number
 * - files: list of (name, blob) pairs
 * Outputs:
 * - N/A
 */
router.put(
  '/submission',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  assignmentController.submitAssignmentHandler
);

/**
 * Gets a student’s existing submission and results
 * Inputs:
 * - studentId: number
 * - assignmentId: number
 * Outputs:
 * - mark: number
 * - totalMarks: number
 * - comment: string
 * - files: list of (name, blob) pairs
 */
router.get(
  '/:assignmentId/submission/:studentId',
  authenticate,
  assignmentController.getAssignmentSubmissionHandler
);

/**
 * Marks and adds a comment for an assignment submission
 * Inputs:
 * - submissionId: number
 * - mark: string
 * - comment: string
 * Outputs:
 * - N/A
 */
router.put('/mark', authenticate, assignmentController.markAssignmentHandler);

/**
 * Allow teacher to release/un-release assignment feedback to students
 * Inputs:
 * - assignmentId: number
 * - released: boolean
 * Outputs:
 * - N/A
 */
router.put('/release', authenticate, assignmentController.releaseMarksHandler);

/**
 * Gets all submissions for the assignment so the teacher can view them
 * Inputs:
 * - assignmentId: number
 * Outputs:
 * - assignments: list of objects, each containing:
 *  - submissionId: number
 *  - fileId: number
 *  - studentName: string
 *  - email: number
 *  - mark: number
 *  - markerName: string
 *  - comment: string
 */
router.get(
  '/submissions/:assignmentId',
  authenticate,
  assignmentController.getAllSubmissionsForAssignmentHandler
);

/**
 * Deletes an assignment
 * Inputs:
 * - assignmentId: number
 * Outputs:
 * - assignments: list of objects, each containing:
 *  - submissionId: number
 *  - fileId: number
 *  - studentName: string
 *  - email: number
 *  - mark: number
 *  - markerName: string
 *  - comment: string
 */
router.delete('/:assignmentId', authenticate, assignmentController.deleteAssignmentHandler);

module.exports = router;
