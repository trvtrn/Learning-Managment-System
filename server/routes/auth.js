const express = require('express');
const { authenticate } = require('../utils/helpers');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * Creates a new user
 * Inputs:
 * - email: string
 * - password: string
 * - firstName: string
 * - lastName: string
 * Outputs:
 * - userId: number
 * - token: string
 */
router.post('/user', authController.createUserHandler);

/**
 * Attempts to log in a user
 * Inputs:
 * - email: string
 * - password: string
 * Outputs:
 * - userId: number
 */
router.post('/login', authController.loginHandler);

/**
 * Requests a password reset link to be emailed to the user
 * Inputs:
 * - email: string
 * Outputs:
 * - N/A
 */
router.post('/reset', authController.sendResetLinkHandler);

/**
 * Get user details by token (id, email, firstName, lastName)
 */
router.get('/user', authenticate, authController.getUserDetailsByTokenHandler);

/**
 * Get user details by token (id, email, firstName, lastName)
 */
router.get('/user/:userId', authenticate, authController.getUserDetailsByIdHandler);

/**
 * Updates a user's password following completing the password reset email process
 * Inputs:
 * - token: string
 * - password: string
 * Outputs:
 * - N/A
 */
router.put('/reset', authController.testResetCodeHandler);

/**
 * Deletes a user from the system
 * Inputs:
 * - token: string
 * Outputs:
 * - N/A
 */
router.delete('/user', authenticate, authController.deleteUserHandler);

module.exports = router;
