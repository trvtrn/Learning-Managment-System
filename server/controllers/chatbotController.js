const {
  addChatbotMessage,
  getChatbotHistory,
  deleteChatbotHistory,
  doesUserExist,
} = require('../scripts/database');
const { openai } = require('../scripts/chatbot');
const { MAX_CHATBOT_MESSAGES } = require('../utils/constants');

/**
 * Handler for POST /api/chatbot/ route
 */
const sendMessageHandler = async (req, res) => {
  const userId = req.userId;
  const message = req.body.message;

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'I am a student using a learning management system called Toodles. ' +
          'Your name is ToodlesGPT, a teaching assistant on Toodles. ' +
          'Explain concepts to me encouragingly and concisely. ' +
          'If you think your answer might be inaccurate, add a note at the end of your response indicating why.',
      },
      {
        role: 'user',
        content: message,
      },
    ],
  });

  const responseMessage = completion.data.choices[0].message.content;

  // store question in the db
  let sender = 'user';
  let direction = 'outgoing';
  addChatbotMessage(message, sender, direction, userId);

  // store answer in the db
  sender = 'ToodlesGPT';
  direction = 'incoming';
  addChatbotMessage(responseMessage, sender, direction, userId);

  res.send({ message: responseMessage });
};

/**
 * Handler for GET /api/chatbot/:userId route
 */
const getMessagesHandler = async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!doesUserExist(userId)) {
    return res.status(404).send({ message: 'invalid user ID' });
  }
  const chatHistory = getChatbotHistory(userId);
  res.send({ messages: chatHistory.slice(-MAX_CHATBOT_MESSAGES) });
};

/**
 * Handler for DELETE /api/chatbot/:userId route
 */
const deleteChatbotHistoryHandler = async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!doesUserExist(userId)) {
    return res.status(404).send({ message: 'invalid user ID' });
  }
  deleteChatbotHistory(userId);
  res.send();
};

module.exports = {
  sendMessageHandler,
  getMessagesHandler,
  deleteChatbotHistoryHandler,
};
