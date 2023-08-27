const express = require('express');
const { authenticate } = require('../utils/helpers');
const courses = require('../controllers/coursesController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 */

/**
 * Returns all courses that the user is enrolled in.
 * Outputs:
 * - List of objects containing
 *   courseId: number
 *   courseName: string
 *   firstName: string (first name of course creator)
 *   lastName: string (last name of course creator)
 */
router.get('/', authenticate, courses.getAllCoursesHandler);

/**
 * Creates a new course. The user is set to be the course creator with the educator role.
 * Returns error if the member list has a non-existent user.
 * Inputs:
 * - courseName: string
 * - members: list of objects containing
 *   email: string
 *   role: string
 * Outputs:
 * - courseId: number (ID of the newly created course)
 */
router.post('/', authenticate, courses.addCourseHandler);

/**
 * Deletes the given course.
 * Returns error if the given course does not exist.
 * Inputs:
 * - courseId: string (must be castable to an integer)
 */
router.delete('/:courseId', authenticate, courses.deleteCourseHandler);

/**
 * Get the course name and creator's first and last name for a courseId
 * Inputs:
 * - courseId: number (in params)
 * - courseName: string
 */
router.put('/:courseId', authenticate, courses.updateCourseHandler);

/**
 * Get the course name and creator's first and last name for a courseId
 * Inputs:
 * - courseId: number
 * Outputs:
 * - courseName: string
 * - firstName: string
 * - lastName: string
 */
router.get('/:courseId', authenticate, courses.getCourseHandler);

module.exports = router;
