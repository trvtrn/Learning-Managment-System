const DBHandler = require('./handler');

class ChatbotDBHandler extends DBHandler {
  constructor(db, authHandler) {
    super(db);
    this.authHandler = authHandler;
  }
  /**
   * Adds a chatbot message for the given user to the database.
   * @param {string} message - the message
   * @param {string} sender - who sent the message - user or chatbot
   * @param {string} direction - outgoing or incoming
   * @param {number} userId - ID of the user
   * @returns {messageId: number}}
   */
  addChatbotMessage = (message, sender, direction, userId) => {
    const messageTime = Date.now();

    const messageId = this.db
      .prepare(
        'INSERT INTO chatbotMessages (message, sender, direction, userId, messageTime) VALUES(?, ?, ?, ?, ?)'
      )
      .run(message, sender, direction, userId, messageTime).lastInsertRowid;

    return { messageId };
  };

  /**
   * Gets all chatbot messages for the given user
   * @param {number} userId - ID of the user
   * @returns {messages[]} - list of messages
   */
  getChatbotHistory = (userId) => {
    return this.db
      .prepare(
        'SELECT id as messageId, message, sender, direction FROM chatbotMessages WHERE userId = ?'
      )
      .all(userId);
  };

  /**
   * Deletes the chatbot messages for the corresponding userId
   * @param {number} userId - ID of the user
   * @returns {number} - number of assignments deleted
   */
  deleteChatbotHistory = (userId) => {
    return this.db.prepare('DELETE FROM chatbotMessages where userId = ?').run(userId);
  };
}

module.exports = ChatbotDBHandler;
