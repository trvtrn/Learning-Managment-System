const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/quizzesController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist
 */

/**
 * Gets all quizzes in the given course.
 * Inputs:
 * - courseId: number
 * Outputs:
 * - array of
 *   - quizId: number
 *   - name: string
 *   - releaseDate: number (milliseconds since epoch)
 *   - dueDate: number (milliseconds since epoch)
 *   - duration: number (minutes)
 *   - weighting: number (percentage between 0 and 100)
 *   - questionCount: number
 *   - totalMarks: number
 */
router.get('/:courseId', authenticate, controller.getAllQuizzesHandler);

module.exports = router;
