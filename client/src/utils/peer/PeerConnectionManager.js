import Peer from 'peerjs';

/**
 * Creates a dummy video track
 * @returns {MediaStreamTrack}
 */
function createBlankVideoTrack() {
  const canvas = document.createElement('canvas');
  canvas.getContext('2d').fillRect(0, 0, 1, 1);
  return Object.assign(canvas.captureStream().getVideoTracks()[0], {
    enabled: true,
  });
}

/**
 * Creates a dummy audio track
 * @returns {MediaStreamTrack}
 */
function createBlankAudioTrack() {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
}

/**
 * Manages bi-directional p2p connections for live audio and video sharing
 * in an online class
 */
export default class PeerConnectionManager {
  /**
   * @param {number} userId the id of the current user
   * @param {HTMLAudioElement} audio audio element to play incoming audio
   * @param {HTMLVideoElement} video video element to play incoming video
   * or video that the user is currently sharing
   */
  constructor(userId, audio, video) {
    this.userId = userId;
    this.audio = audio;
    this.video = video;
    this.audio.srcObject = new MediaStream();
    this.currentSharer = null;
    this.otherPeers = new Map();
    this.mediaStream = new MediaStream([createBlankAudioTrack(), createBlankVideoTrack()]);
  }

  /**
   * Initialises a connection with the brokering server
   * @param {number} classId
   * @param {string} token authentication token
   */
  initPeer = (classId, token) => {
    this.peer = new Peer({
      path: '/',
      host: '/',
      port: process.env.REACT_APP_PEER_SERVER_PORT,
      token: `classId=${classId}.${token}`,
    });
    this.peer.on('call', this.handleReceiveCall);
  };

  /**
   * Calls a new-joining peer if the peer is not the current user and they
   * have not already joined the class on another client.
   * Upon receiving the user's stream, the user's call and stream information
   * is recorded.
   * @param {string} callerId the id of the peer to call generated by the brokering server
   * @param {number} userId the id of the user to call
   */
  callPeer = (callerId, userId) => {
    if (userId === this.userId || this.otherPeers.has(userId)) {
      return;
    }
    const call = this.peer.call(callerId, this.mediaStream, {
      metadata: { userId: this.userId, isSharing: this.isSharing },
    });
    call.on('stream', (stream) => {
      stream.getAudioTracks().forEach((track) => this.audio.srcObject.addTrack(track, stream));
      this.otherPeers.set(userId, { call, stream });
    });
  };

  /**
   * Handles receiving the calls initiated by others already in the class.
   * If there is any user currently playing a stream, their stream will start
   * immediately
   * @param {MediaConnection} call
   */
  handleReceiveCall = (call) => {
    if (this.otherPeers.has(call.metadata.userId)) {
      return;
    }
    call.answer(this.mediaStream);
    call.on('stream', (stream) => {
      this.otherPeers.set(call.metadata.userId, {
        call,
        stream,
      });
      stream.getAudioTracks().forEach((track) => this.audio.srcObject.addTrack(track, stream));
      if (call.metadata.isSharing) {
        this.currentSharer = call.metadata.userId;
        this.video.srcObject = stream;
      }
    });
  };

  /**
   * Switches to watching the stream of the user that is currently streaming
   * @param {number} userId
   */
  handleSwitchStream = (userId) => {
    // Don't switch stream if I requested the switch
    if (userId === this.userId) {
      this.currentSharer = userId;
      return;
    }

    if (!this.otherPeers.has(userId)) {
      return;
    }

    this.currentSharer = userId;
    this.video.srcObject = this.otherPeers.get(userId).stream;
  };

  /**
   * Deletes the peer from the record of peers when they disconnect
   * @param {string} callerId
   */
  handleDisconnect = (callerId) => {
    for (const userId of this.otherPeers.keys()) {
      if (this.otherPeers.get(userId).call.peer === callerId) {
        this.otherPeers.delete(userId);
        if (this.currentSharer === userId) {
          this.video.srcObject = null;
        }
      }
    }
  };

  /**
   * Mutes the current user.
   */
  handleMute = () => {
    this.mediaStream.getAudioTracks().forEach((track) => {
      track.stop();
    });
  };

  /**
   * Unmutes the current user
   * @returns {Promise<MediaStream>} a promise resolving to the audio stream
   * if permission is granted by the user
   */
  handleUnmute = () => {
    if (!navigator.mediaDevices) {
      return Promise.reject(new Error('No media devices found'));
    }
    return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaStream.getAudioTracks().forEach((track) => {
        this.mediaStream.removeTrack(track);
      });
      stream.getAudioTracks().forEach((track) => {
        this.mediaStream.addTrack(track);
      });
      this.replaceAudioSenderTracks(stream);
    });
  };

  /**
   * Replaces all outgoing audio tracks with the audio tracks in the
   * provided stream
   * @param {MediaStream} stream
   */
  replaceAudioSenderTracks = (stream) => {
    this.allMediaConnections.forEach((call) => {
      call.peerConnection
        ?.getSenders()
        .filter((sender) => sender.track.kind === 'audio')
        .forEach((sender) => {
          sender.replaceTrack(stream.getAudioTracks()[0], stream);
        });
    });
  };

  /**
   * Replaces all outgoing video tracks with the video tracks in the provided
   * stream
   * @param {MediaStream} stream
   */
  replaceVideoSenderTracks = (stream) => {
    this.allMediaConnections.forEach((call) => {
      call.peerConnection
        ?.getSenders()
        .filter((sender) => sender.track.kind === 'video')
        .forEach((sender) => {
          sender.replaceTrack(stream.getVideoTracks()[0], stream);
        });
    });
  };

  /**
   * Starts a screen share
   * @returns {Promise<MediaStream>} a promise resolving to the video stream if
   * permission is granted by the user
   */
  startSharing = () => {
    if (!navigator.mediaDevices) {
      return Promise.reject(new Error('No media devices found'));
    }
    return navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
      // Play own video
      this.mediaStream.getVideoTracks().forEach((track) => {
        track.stop();
        this.mediaStream.removeTrack(track);
      });
      stream.getVideoTracks().forEach((track) => {
        this.mediaStream.addTrack(track);
      });
      this.video.srcObject = stream;
      this.currentSharer = this.userId;

      this.replaceVideoSenderTracks(stream);

      // Tell everyone else to switch to watching my stream
      this.ws.send(JSON.stringify({ type: 'switch-stream', userId: this.userId }));

      return stream;
    });
  };

  /**
   * Stops a screen share
   */
  stopSharing = () => {
    // Reset outgoing media stream
    this.currentSharer = null;
    this.video.srcObject = null;
    this.mediaStream.getVideoTracks().forEach((track) => {
      track.stop();
    });

    // Send a blank screen to other peers
    this.allMediaConnections.forEach((call) => {
      call.peerConnection
        ?.getSenders()
        .filter((sender) => sender.track.kind === 'video')
        .forEach((sender) => {
          sender.replaceTrack(createBlankVideoTrack());
        });
    });
  };

  /**
   * Returns true if the user is currently screen sharing, false otherwise
   * @returns {boolean}
   */
  get isSharing() {
    return this.currentSharer === this.userId;
  }

  /**
   * Returns all current MediaConnections to other peers
   * @returns {MediaConnection[]}
   */
  get allMediaConnections() {
    return Array.from(this.otherPeers.values()).map(({ call }) => call);
  }

  /**
   * Sets websocket used for communication between others in an online class
   * online class
   * @param {WebSocket}
   */
  set ws(newWS) {
    this._ws = newWS;
  }

  /**
   * Gets the current websocket
   */
  get ws() {
    return this._ws;
  }
}
