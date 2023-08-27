const express = require('express');
const { authenticate } = require('../utils/helpers');
const memberController = require('../controllers/memberController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist
 * - user does not exist
 * - user is not enrolled in course
 */

/**
 * Deletes a member from the given course.
 * Note that the user making this request is allowed to delete themself from a course.
 * Inputs:
 * - courseId: string (must be castable to an integer)
 * - userId: string (must be castable to an integer)
 */
router.delete('/:courseId/:userId', authenticate, memberController.deleteMemberHandler);

/**
 * Gets the role of the current user in the given course.
 * Inputs:
 * - courseId: string (must be castable to an integer)
 * Outputs:
 * - role: 'Student' | 'Educator'
 */
router.get('/:courseId', authenticate, memberController.getMemberRoleHandler);

/**
 * Updates the role of a member in the given course.
 * Inputs:
 * - courseId: number
 * - userId: number
 * - role: 'Student' | 'Educator'
 */
router.put('/', authenticate, memberController.updateMemberRoleHandler);

/**
 * Fetches the role of a user for a given course
 * Inputs:
 * - courseId: number
 * - userId: number
 * Outputs:
 * - role: string
 */
router.get('/:courseId/:userId', authenticate, memberController.getMemberRoleHandler);

module.exports = router;
