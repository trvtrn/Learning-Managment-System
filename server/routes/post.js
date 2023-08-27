const express = require('express');
const multer = require('multer');
const { STORAGE } = require('../utils/constants');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/postController');

const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist (where relevant)
 * - post does not exist (where relevant)
 */

/**
 * Adds a post to the given course with the given details.
 * Inputs:
 * - title: string
 * - text: string
 * - courseId: number
 * - categoryId: number
 * - shouldNotifyStudents: boolean
 * Outputs:
 * - postId: number (ID of the newly added post)
 */
router.post(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  controller.createPostHandler
);

/**
 * Gets details of the given post.
 * Inputs:
 * - postId: number
 * Outputs:
 * - categoryId: number
 * - categoryName: string
 * - categoryColor: string
 * - userId: number (ID of post creator)
 * - firstName: string (first name of post creator)
 * - lastName: string (last name of post creator)
 * - timePosted: number
 * - text: string
 * - replies: list of numbers representing reply IDs
 * - files: list of objects containing
 *   fileId: number
 *   fileName: string
 */
router.get('/:postId', authenticate, controller.getPostHandler);

/**
 * Updates the details of the given post.
 * Inputs:
 * - postId: number
 * - title: string
 * - text: string
 * - categoryId: number
 * - shouldNotifyStudents: boolean
 * - files: list of Express.Multer.File objects
 */
router.put(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  controller.updatePostHandler
);

/**
 * Deletes the given post.
 * Inputs:
 * - postId: number
 */
router.delete('/:postId', authenticate, controller.deletePostHandler);

module.exports = router;
