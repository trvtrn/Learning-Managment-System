const { tokenToUserId } = require('../utils/helpers');
const {
  isUserEnrolledIn,
  getCourseForClass,
  addMessageToClass,
  getUserDetailsById,
  getMembersDetails,
} = require('./database');
const { WebSocket } = require('ws');
const WSConnectionManager = require('../utils/websocket/WSConnectionManager');

const connectionManager = new WSConnectionManager();

/**
 * Notifies everyone in class with classId of a change in participants
 */
function handleChangeInParticipants(classId) {
  connectionManager.notifyAll(classId, {
    type: 'participants',
    participants: getMembersDetails(
      getCourseForClass(classId),
      connectionManager.getParticipantList(classId)
    ),
  });
}

/**
 * Sets up a given websocket, called after a connection is opened.
 * Specifically, it makes the websocket handle messages, and adds the
 * websocket to the given 'connections' map
 * @param {number} classId
 * @param {WebSocket} ws
 * @param {WebSocketServer} wss
 */
function setUpWS(classId, userId, ws) {
  connectionManager.addWS(classId, userId, ws);
  handleChangeInParticipants(classId);
  const { firstName, lastName } = getUserDetailsById(userId);
  ws.on('message', (data) => {
    const json = JSON.parse(data);
    if (json.type === 'message') {
      // Handle live chat message
      const timeSent = Date.now();
      const messageId = addMessageToClass(classId, userId, timeSent, json.text);
      connectionManager.notifyAll(classId, {
        messageId,
        userId,
        firstName,
        lastName,
        timeSent,
        ...json,
      });
    } else if (json.type === 'switch-stream') {
      connectionManager.notifyAll(classId, {
        type: 'switch-stream',
        userId: json.userId,
      });
    }
  });

  ws.on('close', () => {
    connectionManager.removeWS(classId, userId, ws);
    handleChangeInParticipants(classId);
  });

  ws.on('error', (e) => {
    console.error(e.message);
    ws.close();
  });
}

/**
 * Configure the server and websocket server for chat handling
 * @param {http.Server} server
 * @param {WebSockerServer} wss
 */
function configureWSS(server, wss) {
  server.on('upgrade', (request, socket, head) => {
    socket.on('error', (e) => console.error(e.message));
    const url = new URL(request.url, `ws://${request.headers.host}`);
    const token = url.searchParams.get('token');

    // Handle authentication
    const userId = tokenToUserId(token);
    if (userId === -1) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Check that user is authorised to send messages in this chat
    const classId = parseInt(url.searchParams.get('classId'));
    const courseId = getCourseForClass(classId);
    if (!isUserEnrolledIn(userId, courseId)) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }

    // Proceed to connection
    request.userId = userId;
    request.classId = classId;
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, request) => {
    console.log('New connection');
    setUpWS(request.classId, request.userId, ws);
  });
}

module.exports = { configureWSS, connectionManager };
