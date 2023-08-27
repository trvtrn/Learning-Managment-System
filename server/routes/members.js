const express = require('express');
const { authenticate } = require('../utils/helpers');
const courseMembers = require('../controllers/membersController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist
 * - some users in the member list do not exist (where relevant)
 */

/**
 * Gets all members of the given course.
 * Inputs:
 * - courseId: string (must be castable to an integer)
 * Outputs:
 * - list of objects containing
 *   userId: number
 *   email: string
 *   firstName: string
 *   lastName: string
 *   role: 'Student' | 'Educator'
 */
router.get('/:courseId', authenticate, courseMembers.getAllMembersOfCourseHandler);

/**
 * Adds the given members to the existing member list of the given course.
 * Adding already enrolled members has no effect.
 * Inputs:
 * - courseId: number
 * - members: list of objects containing
 *   email: string (email of user)
 *   role: 'Student' | 'Educator' (role given to user)
 */
router.post('/', authenticate, courseMembers.addCourseMembersHandler);

module.exports = router;
