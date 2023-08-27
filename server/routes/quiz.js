const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/quizController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist (where relevant)
 * - quiz does not exist (where relevant)
 * - user does not exist (where relevant)
 * - user has not submitted to quiz (where relevant)
 */

/**
 * Gets details for the given quiz.
 * An educator of the course can always get full information about the questions.
 * A student can access full information about the questions if it's past the due
 * date OR
 * A student of the course can only access quiz questions if
 * - They have started an attempt to the quiz
 * The isAnswer field will only be present for students if
 * - They have submitted the quiz
 * Inputs:
 * - quizId: number
 * Outputs:
 * - name: string
 * - description: string
 * - releaseDate: string
 * - dueDate: string
 * - duration: number (minutes)
 * - totalMarks: number
 * - weighting: number (percentage from 0 to 100)
 * - questions: array of
 *   - questionNumber: number
 *   - questionText: string
 *   - questionType: string
 *   - maximumMark: number
 *   - options: array of
 *     - optionNumber
 *     - optionText
 *     - isAnswer?
 * Note that releaseDate and dueDate can be converted to Date objects by passing in the
 * strings as a parameter to the Date constructor.
 */
router.get('/:quizId', authenticate, controller.getQuizHandler);

/**
 * Adds a quiz with the given details to the given course.
 * Inputs:
 * - courseId: number
 * - name: string
 * - description: string
 * - releaseDate: string
 * - dueDate: string
 * - duration: number (minutes)
 * - weighting: number (percentage from 0 to 100)
 * - questions: array of
 *   - questionType
 *   - questionText
 *   - maximumMark
 *   - options: array of
 *     - optionNumber
 *     - optionText
 *     - isAnswer
 * Outputs:
 * - quizId: number (ID of the newly created quiz)
 */
router.post('/', authenticate, controller.addQuizHandler);

/**
 * Updates the details of the given quiz.
 * Inputs:
 * - quizId: number
 * - name: string
 * - description: string
 * - releaseDate: string
 * - dueDate: string
 * - duration: number (minutes)
 * - weighting: number (percentage from 0 to 100)
 * - questions: array of
 *   - questionType
 *   - questionText
 *   - maximumMark
 *   - options: array of
 *     - optionNumber
 *     - optionText
 *     - isAnswer
 */
router.put('/', authenticate, controller.updateQuizHandler);

/**
 * Deletes the given quiz and all associated submissions.
 * Inputs:
 * - quizId: number
 */
router.delete('/:quizId', authenticate, controller.deleteQuizHandler);

/**
 * Gets all submissions to the given quiz.
 * Inputs:
 * - quizId: number
 * Outputs:
 * - array of
 *   - userId: number
 *   - firstName: string
 *   - lastName: string
 *   - email: string
 *   - totalMark: number
 *   - markerId: number
 *   - markerFirstName: string
 *   - markerLastName: string
 */
router.get('/:quizId/submissions', authenticate, controller.getAllQuizSubmissionsHandler);

/**
 * Gets the requester's submitted answers to the given quiz.
 * Inputs:
 * - quizId: number
 * Outputs:
 * - startTime: number (milliseconds since epoch)
 * - answers: array of
 *   - questionNumber: number
 *   - answerText?: string (contents of short answer response)
 *   - optionNumber?: number (chosen multiple choice option)
 */
router.get('/:quizId/submission', authenticate, controller.getSubmissionHandler);

/**
 * Gets the given user's submitted answers to the given quiz.
 * Inputs:
 * - quizId: number
 * - userId: number
 * Outputs:
 * - startTime: number (milliseconds since epoch)
 * - answers: array of
 *   - questionNumber: number
 *   - answerText?: string (contents of short answer response)
 *   - optionNumber?: number (chosen multiple choice option)
 */
router.get('/:quizId/submission/:userId', authenticate, controller.getSubmissionOfUserHandler);

/**
 * Starts a quiz for the user.
 * Also gets the time that this quiz was started.
 * Fails if:
 * - quiz due date has passed, OR
 * - quiz has already been started
 * Inputs:
 * - quizId: number
 * Outputs:
 * - startTime: number (milliseconds since epoch)
 */
router.post('/:quizId/submission', authenticate, controller.startQuizSubmissionHandler);

/**
 * Updates the responses to the given quiz made by the user.
 * Fails if:
 * - quiz has not been started, OR
 * - quiz duration has expired, OR
 * - quiz due date has passed
 * Inputs:
 * - quizId: number
 * - answers: array of
 *   - questionNumber: number
 *   - answerText?: string (response to short answer question)
 *   - optionNumber?: number (choice made for multiple choice question)
 * Outputs:
 * - startTime: number (milliseconds since epoch)
 */
router.put('/:quizId/submission', authenticate, controller.makeSubmissionHandler);

/**
 * Gets the requester's marks for all short answer questions of the given quiz.
 * Fails if:
 * - quiz marks have not been released, OR
 * - quiz due date has not been passed
 * Inputs:
 * - quizId: number
 * Outputs:
 * - array of
 *   - questionNumber: number
 *   - mark: number
 */
router.get('/:quizId/mark', authenticate, controller.getOwnQuizMarksHandler);

/**
 * Gets the user's marks for all short answer questions of the given quiz.
 * Fails if:
 * - quiz marks have not been released, OR
 * - quiz due date has not been passed
 * Inputs:
 * - quizId: number
 * Outputs:
 * - array of
 *   - questionNumber: number
 *   - mark: number
 */
router.get('/:quizId/mark/:userId', authenticate, controller.getQuizMarksHandler);

/**
 * Assigns a mark for all short answer responses made by the given user for the given quiz.
 * Inputs:
 * - quizId: number
 * - userId: number
 * - questionMarks: array of
 *   - questionNumber: number
 *   - mark: number
 */
router.put('/:quizId/mark/:userId', authenticate, controller.markSubmissionHandler);

/**
 * Updates whether marks are released for the given quiz.
 * Inputs:
 * - quizId: number
 * - releaseMarks: boolean
 */
router.put('/:quizId/release', authenticate, controller.setMarksReleasedHandler);

module.exports = router;
