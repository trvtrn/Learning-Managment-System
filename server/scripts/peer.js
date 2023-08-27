const { tokenToUserId } = require('../utils/helpers');
const { isUserEnrolledIn, getCourseForClass } = require('./database');
const { connectionManager } = require('./websocket');

/**
 * Configures the brokering server for p2p connections.
 * @param {PeerServer} peerServer
 */
function configurePeerServer(peerServer) {
  peerServer.on('connection', (client) => {
    // Extract classId and authentication token from the client's token string.
    const classId = parseInt(
      client.getToken().match(/^classId=(?<classId>[0-9])+\./).groups.classId
    );
    const token = client.getToken().slice(client.getToken().indexOf('.') + 1);
    const userId = tokenToUserId(token);

    if (!isUserEnrolledIn(userId, getCourseForClass(classId))) {
      connectionManager.getParticipantList(classId);
      client.getSocket().close();
      return;
    }

    // Notify all currently connected users in the class given the user is authorised
    // to join the class.
    connectionManager.notifyAll(classId, {
      type: 'connection',
      callerId: client.getId(),
      userId,
    });
  });

  peerServer.on('disconnect', (client) => {
    const classId = parseInt(
      client.getToken().match(/^classId=(?<classId>[0-9])+\./).groups.classId
    );

    // Notify all users in the peer's class that a peer has disconnected
    connectionManager.notifyAll(classId, {
      type: 'disconnect',
      callerId: client.getId(),
    });
  });
}

module.exports = { configurePeerServer };
