import { WEBSOCKET_URL } from '../constants';
import { compareMembers } from '../helpers';
/**
 * Sets up a new websocket connection
 * @param {number} classId
 * @param {PeerConnectionManager} peerManager
 * @param {Dispatch} setMessages
 * @param {Dispatch} setParticipants
 * @param {Dispatch} setIsSharing
 * @param {Dispatch} setHasEnteredClass
 * @param {Dispatch} setErrorMessage
 * @returns {WebSocket}
 */
export default function setUpWS(
  classId,
  peerManager,
  setMessages,
  setParticipants,
  setIsSharing,
  setHasEnteredClass,
  setErrorMessage
) {
  const newWS = new WebSocket(
    `${WEBSOCKET_URL}/?token=${localStorage.getItem('token')}&classId=${classId}`
  );
  newWS.onopen = () => {
    console.log('Connection opened');
  };
  newWS.onmessage = (e) => {
    const newMessage = JSON.parse(e.data);
    if (newMessage.type === 'message') {
      setMessages((prev) => [
        ...prev,
        {
          messageId: newMessage.messageId,
          senderId: newMessage.userId,
          senderFirstName: newMessage.firstName,
          senderLastName: newMessage.lastName,
          timestamp: newMessage.timeSent,
          message: newMessage.text,
        },
      ]);
    } else if (newMessage.type === 'participants') {
      setParticipants(newMessage.participants.sort(compareMembers));
    } else if (newMessage.type === 'connection') {
      peerManager.callPeer(newMessage.callerId, newMessage.userId);
    } else if (newMessage.type === 'switch-stream') {
      peerManager.handleSwitchStream(newMessage.userId);
      setIsSharing(peerManager.isSharing);
    } else if (newMessage.type === 'disconnect') {
      peerManager.handleDisconnect(newMessage.callerId);
    }
  };
  newWS.onclose = (e) => {
    console.log('Connection closed');
    setHasEnteredClass(false);
    setErrorMessage(e.reason || 'You could not be connected');
  };
  return newWS;
}
