const express = require('express');
const multer = require('multer');
const { STORAGE } = require('../utils/constants');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/replyController');
const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - post does not exist (where relevant)
 * - reply does not exist (where relevant)
 */

/**
 * Adds a reply to the given post with the given details.
 * Inputs:
 * - postId: number
 * - text: string
 * - files: list of Express.Multer.File objects
 * Outputs:
 * - replyId: number (ID of the newly added reply)
 */
router.post(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  controller.createReplyHandler
);

/**
 * Gets details for the given reply.
 * Inputs:
 * - replyId: number
 * Ouputs:
 * - userId: number (ID of replier)
 * - firstName: string (first name of replier)
 * - lastName: string (last name of replier)
 * - text: string
 * - files: list of objects containing
 *   fileId: number
 *   fileName: string
 */
router.get('/:replyId', authenticate, controller.getReplyHandler);

/**
 * Updates the given reply with the given details.
 * Inputs:
 * - replyId: number
 * - text: string
 * - files: list of Express.Multer.File objects
 */
router.put(
  '/',
  authenticate,
  multer({ storage: STORAGE }).array('files'),
  controller.updateReplyHandler
);

/**
 * Deletes the given reply.
 * Inputs:
 * - replyId: number
 */
router.delete('/:replyId', authenticate, controller.deleteReplyHandler);

module.exports = router;
