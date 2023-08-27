const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/classesController');
const router = express.Router();

/**
 * Returns all classes for a given course.
 * Returns error if:
 * - course does not exist
 * - user is not enrolled in the course
 * Inputs:
 * - courseId: string (must be castable to an integer)
 * Outputs:
 * - List of objects containing
 *   classId: number
 *   className: string
 *   startTime: string
 *   endTime: string
 *   frequency: 'once' | 'weekly' | 'fortnightly'
 * Note that startTime and endTime can be converted to Date objects by passing in the
 * strings as a parameter to the Date constructor.
 */
router.get('/:courseId', authenticate, controller.getClassesHandler);

module.exports = router;
