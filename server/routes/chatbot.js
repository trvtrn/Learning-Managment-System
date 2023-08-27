const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../utils/helpers');

const router = express.Router();

/**
 * Sens a new message to the chatbot and stores the answer in the DB
 * Inputs:
 * - message: string
 * Outputs:
 * - N/A
 */
router.post('/', authenticate, chatbotController.sendMessageHandler);

// /**
//  * Get the user’s last 10 messages and answers
//  * Inputs:
//  * - userId: number
//  * Outputs:
//  * - messages: list of objects, each containing:
//  *  - messageId: number
//  *  - message: string
//  *  - sender: string
//  *  - direction: string
//  */
router.get('/:userId', authenticate, chatbotController.getMessagesHandler);

// /**
//  * Deletes all messages for that userId
//  * Inputs:
//  * - userId: number
//  * Outputs:
//  * - N/A
//  */
router.delete('/:userId', authenticate, chatbotController.deleteChatbotHistoryHandler);

module.exports = router;
