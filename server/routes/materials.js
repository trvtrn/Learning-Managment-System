const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/materialsController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 */

/**
 * Gets all materials for the given course.
 * Returns error if no such course exists.
 * Inputs:
 * - courseId: string (must be castable to an integer)
 * Outputs:
 * - list of objects containing
 *   materialId: number
 *   materialName: string
 *   timeCreated: string (castable to a Date by passing as an argument to Date constructor)
 */
router.get('/:courseId', authenticate, controller.getAllMaterialsForCourseHandler);

module.exports = router;
