const express = require('express');
const { authenticate } = require('../utils/helpers');
const controller = require('../controllers/classController');
const router = express.Router();

/**
 * Each of the endpoints below return an error if:
 * - request is not authenticated
 * - user is not authorised to perform the operation
 * - course does not exist (where relevant)
 * - class does not exist (where relevant)
 */

/**
 * Gets a list of messages from the class with the given classId.
 * Returns error if class is not currently active.
 * Inputs:
 * - classId: string (must be castable to an integer)
 * Outputs:
 * - className: string
 * - messages:
 *   List of objects containing
 *   - messageId: number
 *   - userId: number (id of sender)
 *   - firstName: string (first name of sender)
 *   - lastName: string (last name of sender)
 *   - timeSent: number (milliseconds since epoch)
 *   - text: string (content of message)
 */
router.get('/:classId', authenticate, controller.getClassHandler);

/**
 * Creates a new class for the given course and returns its ID.
 * Inputs:
 * - courseId: number
 * - className: string
 * - startTime: string
 * - endTime: string
 * - frequency: 'once' | 'weekly' | 'fortnightly'
 * Outputs:
 * - classID: number
 * Note that startTime and endTime must be convertible to Date objects by passing in the
 * strings as a parameter to the Date constructor.
 */
router.post('/', authenticate, controller.addClassHandler);

/**
 * Returns all classes for a given course.
 * Inputs:
 * - classId: number
 * - className: string
 * - startTime: string
 * - endTime: string
 * - frequency: 'once' | 'weekly' | 'fortnightly'
 * Note that startTime and endTime must be convertible to Date objects by passing in the
 * strings as a parameter to the Date constructor.
 */
router.put('/', authenticate, controller.updateClassHandler);

/**
 * Deletes the class with given classId.
 * Inputs:
 * - classId: string (must be castable to an integer)
 */
router.delete('/:classId', authenticate, controller.deleteClassHandler);

module.exports = router;
