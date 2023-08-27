const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/postsController');
const router = express.Router();

/**
 * Gets all posts in the forum of the given course.
 * Fails if no such course exists.
 * Inputs:
 * - courseId: number
 * Outputs:
 * - list of objects containing
 *   postId: number
 *   title: string
 *   text: string
 *   categoryId: number
 *   categoryName: number
 *   categoryColor: string
 *   userId: number (ID of post creator)
 *   firstName: string (first name of post creator)
 *   lastName: string (last name of post creator)
 *   timePosted: number
 */
router.get('/:courseId', authenticate, controller.getPostsHandler);

module.exports = router;
