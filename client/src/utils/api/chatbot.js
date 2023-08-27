import { sendAuthenticatedRequest } from '../helpers';

/**
 * Post request for a user's chatbot message
 * @param {string} message
 * @param {number} userId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function sendChatMessage(message, userId, navigate) {
  return sendAuthenticatedRequest(
    `/api/chatbot`,
    navigate,
    'POST',
    { 'Content-Type': 'application/json' },
    JSON.stringify({ userId, message })
  );
}

/**
 * Gets the current user's chat bot messages
 * @param {number} userId
 * @param {NavigateFunction} navigate
 * @returns {Promise<{
 *  messageId: number,
 *  message: string,
 *  sender: string,
 *  direction: string,
 * }[]>}
 */
export function getChatMessages(userId, navigate) {
  return sendAuthenticatedRequest(`/api/chatbot/${userId}`, navigate);
}

/**
 * Deletes the current user's chat bot messages
 * @param {number} userId
 * @param {NavigateFunction} navigate
 * @returns {Promise}
 */
export function deleteChatMessages(userId, navigate) {
  return sendAuthenticatedRequest(`/api/chatbot/${userId}`, navigate, 'DELETE');
}
