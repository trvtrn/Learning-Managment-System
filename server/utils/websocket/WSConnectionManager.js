const WebSocket = require('ws');

/**
 * Manages all websocket connections to users on the app
 */
class WSConnectionManager {
  constructor() {
    this.connections = new Map();
  }

  /**
   * Adds the websocket connection to the map of connections, called after the
   * websocket connection has opened.
   * Does not add the websocket if the user is already connected to the given class
   * and closes the websocket connection.
   * @param {number} classId
   * @param {number} userId
   * @param {WebSocket} ws
   */
  addWS = (classId, userId, ws) => {
    const userIdToWS = this.connections.get(classId);
    if (!userIdToWS) {
      const newUserIdToWS = new Map();
      newUserIdToWS.set(userId, ws);
      this.connections.set(classId, newUserIdToWS);
    } else if (userIdToWS.has(userId)) {
      // Do not allow user to join again.
      ws.close(3000, 'You have already joined this class');
    } else {
      userIdToWS.set(userId, ws);
    }
  };

  /**
   * Removes the given websocket from the map of connections, called after
   * the websocket connection is closed.
   * Only removes the websocket if the websocket matches that of the given
   * class and user
   * @param {number} classId
   * @param {number} userId
   * @param {WebSocket} ws
   */
  removeWS = (classId, userId, ws) => {
    if (ws === this.connections.get(classId)?.get(userId)) {
      this.connections.get(classId).delete(userId);
    }

    // Remove the class map entry contains no more connected users
    if (this.connections.get(classId)?.size === 0) {
      this.connections.delete(classId);
    }
  };

  /**
   * Gets a list of participants' userIds of the given class
   * @param {number} classId
   * @returns {number[]}
   */
  getParticipantList = (classId) => {
    return Array.from(this.connections.get(classId)?.keys() || []);
  };

  /**
   * Gets all websockets associated with a class
   * @param {number} classId
   * @returns {WebSocket[]}
   */
  getClassWS = (classId) => {
    return Array.from(this.connections.get(classId)?.values() || []);
  };

  /**
   * Sends a message object to all websockets associated with the class
   * @param {numebr} classId
   * @param {Object} data
   */
  notifyAll = (classId, data) => {
    this.getClassWS(classId).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  };
}

module.exports = WSConnectionManager;
