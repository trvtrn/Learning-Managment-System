import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconButton, useTheme } from '@mui/material';
import {
  KeyboardArrowLeft,
  ExitToApp,
  Mic,
  MicOff,
  ScreenShare as ScreenShareIcon,
  StopScreenShare,
  KeyboardArrowRight,
} from '@mui/icons-material';

import ClassSideBar from './ClassSideBar/ClassSideBar';
import ScreenShare from './ScreenShare';
import { UserContext } from '../../utils/contexts';
import PeerConnectionManager from '../../utils/peer/PeerConnectionManager';
import setUpWS from '../../utils/websocket/websocket';
import { getClass } from '../../utils/api/classes';

import styles from './Class.module.css';

export default function Class() {
  const { classId } = useParams();
  const { userId } = useContext(UserContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [hasEnteredClass, setHasEnteredClass] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const wsRef = useRef(null);
  const videoRef = useRef();
  const audioRef = useRef();
  const peerManagerRef = useRef(null);

  const setUpClass = useCallback(() => {
    return getClass(classId, navigate).then((data) => {
      if (!userId) {
        return;
      }
      document.title = `${data.className} | Toodles`;
      data.messages.sort((a, b) => a.timeSent - b.timeSent);
      setMessages(
        data.messages.map((messageInfo) => ({
          messageId: messageInfo.messageId,
          senderId: messageInfo.userId,
          senderFirstName: messageInfo.firstName,
          senderLastName: messageInfo.lastName,
          message: messageInfo.text,
        }))
      );
      peerManagerRef.current = new PeerConnectionManager(
        userId,
        audioRef.current,
        videoRef.current
      );
      peerManagerRef.current.initPeer(classId, localStorage.getItem('token'));
      wsRef.current = setUpWS(
        classId,
        peerManagerRef.current,
        setMessages,
        setParticipants,
        setIsSharing,
        setHasEnteredClass,
        setErrorMessage
      );
      peerManagerRef.current.ws = wsRef.current;
    });
  }, [classId, userId, navigate]);

  const handleScreenShare = () => {
    if (!hasEnteredClass) {
      return;
    }
    if (isSharing) {
      peerManagerRef.current.stopSharing();
      setIsSharing(false);
      return;
    }
    peerManagerRef.current
      .startSharing(setIsSharing)
      .then((stream) => {
        setIsSharing(true);
        stream.getTracks()[0].onended = () => {
          peerManagerRef.current.stopSharing();
          setIsSharing(false);
        };
      })
      .catch((e) => console.error(e.message));
  };

  const handleMute = () => {
    if (!hasEnteredClass) {
      return;
    }
    if (!isMuted) {
      peerManagerRef.current.handleMute();
      setIsMuted(true);
    } else {
      peerManagerRef.current
        .handleUnmute()
        .then(() => {
          setIsMuted(false);
        })
        .catch((e) => console.error(e.message));
    }
  };

  useEffect(() => {
    return () => {
      document.title = 'Toodles';
      if (hasEnteredClass && wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [hasEnteredClass]);

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: 'black' }}>
      <div className={styles.topButtonContainer} style={{ minWidth: showChat || '100vw' }}>
        <IconButton
          className={styles.topButton}
          onClick={() => {
            window.close();
          }}
        >
          <ExitToApp />
        </IconButton>
        <IconButton
          className={styles.topButton}
          onClick={() => {
            setShowChat((prev) => !prev);
          }}
        >
          {showChat ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
      </div>
      <ScreenShare
        videoRef={videoRef}
        audioRef={audioRef}
        showChat={showChat}
        hasEnteredClass={hasEnteredClass}
        setHasEnteredClass={setHasEnteredClass}
        handleEnterClass={setUpClass}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <div className={styles.screenShareButtonsContainer} style={{ minWidth: showChat || '100vw' }}>
        <IconButton
          sx={{
            backgroundColor: isMuted ? 'white' : theme.palette.custom.green,
            '&:hover': { backgroundColor: isMuted ? 'white' : theme.palette.custom.green },
          }}
          onClick={handleMute}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>
        <IconButton
          sx={{
            backgroundColor: !isSharing ? 'white' : theme.palette.custom.green,
            '&:hover': { backgroundColor: !isSharing ? 'white' : theme.palette.custom.green },
          }}
          onClick={handleScreenShare}
        >
          {isSharing ? <ScreenShareIcon /> : <StopScreenShare />}
        </IconButton>
      </div>
      {showChat && (
        <ClassSideBar
          classId={classId}
          wsRef={wsRef}
          messages={messages}
          setMessages={setMessages}
          participants={participants}
          hasEnteredClass={hasEnteredClass}
        />
      )}
    </div>
  );
}
