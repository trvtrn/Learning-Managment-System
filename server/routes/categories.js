const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/categoriesController');
const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist (where relevant)
 */

/**
 * Returns all post categories from the forum of the given course.
 * Inputs:
 * - courseId: number
 * Outputs:
 * - list of objects containing:
 *   categoryId: number,
 *   categoryName: string,
 *   categoryColor: string,
 *   selectableForStudents: boolean
 */
router.get('/:courseId', authenticate, controller.getCategoriesHandler);

/**
 * Updates the post categories for the forum of the given course.
 * Inputs:
 * - courseId: number
 * - categories: list of objects containing:
 *   categoryId: number,
 *   categoryName: string,
 *   categoryColor: string,
 *   selectableForStudents: boolean
 */
router.put('/', authenticate, controller.updateCategoriesHandler);

module.exports = router;
