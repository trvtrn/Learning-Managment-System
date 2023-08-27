import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './overrides.css';

import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  ConversationHeader,
  Avatar,
} from '@chatscope/chat-ui-kit-react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import { sendChatMessage, getChatMessages, deleteChatMessages } from '../../utils/api/chatbot';
import { UserContext } from '../../utils/contexts';
import robot from './robot.png';

export default function ChatBot({ setShowChatbot }) {
  const navigate = useNavigate();
  const { userId, firstName } = useContext(UserContext);
  const theme = useTheme();
  const greeting = useMemo(
    () => ({
      message: `Hello ${firstName}, I am ToodlesGPT. What would you like to learn today?`,
      sender: 'ToodlesGPT',
      direction: 'incoming',
    }),
    [firstName]
  );

  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([greeting]);

  useEffect(() => {
    getChatMessages(userId, navigate).then((data) => {
      setMessages((prevMessages) => [
        greeting,
        ...data.messages.map((item) => {
          const { message, sender, direction } = item;
          return { message, sender, direction };
        }),
      ]);
    });
  }, [userId, greeting, setMessages, navigate]);

  const handleSend = (message) => {
    setMessages((prev) => [
      ...prev,
      {
        message,
        sender: 'user',
        direction: 'outgoing',
      },
    ]);

    setTyping(true);

    sendChatMessage(message, userId, navigate)
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          {
            message: data.message,
            sender: 'ToodlesGPT',
            direction: 'incoming',
          },
        ]);
        setTyping(false);
      })
      .catch((err) => {
        setTyping(false);
        console.error(err.message);
      });
  };

  const handleDelete = () => {
    deleteChatMessages(userId, navigate)
      .then(() => {
        setMessages([greeting]);
      })
      .catch((err) => console.error(err.message));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        height: '550px',
        width: '450px',
      }}
    >
      <MainContainer style={{ borderRadius: '5px', borderColor: theme.palette.custom.outline }}>
        <ChatContainer>
          <ConversationHeader
            style={{
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              color: theme.palette.custom.background,
            }}
          >
            <ConversationHeader.Content style={{ fontWeight: 'bolder', padding: '8px' }}>
              <span>ToodlesGPT</span>
            </ConversationHeader.Content>
            <ConversationHeader.Actions>
              <Tooltip title="Delete Conversation">
                <IconButton size="small" onClick={handleDelete}>
                  <DeleteIcon sx={{ color: theme.palette.custom.light }} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setShowChatbot(false)}>
                <CloseIcon sx={{ color: theme.palette.custom.light }} />
              </IconButton>
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList
            autoScrollToBottomOnMount
            autoScrollToBottom
            typingIndicator={
              typing ? (
                <TypingIndicator style={{ padding: '0.7rem' }} content="ToodlesGPT is typing" />
              ) : null
            }
          >
            {messages.map((message, i) => (
              <Message key={i} model={message} style={{ paddingTop: '0.75rem' }}>
                {message.sender === 'ToodlesGPT' && <Avatar src={robot} name="robot" />}
              </Message>
            ))}
          </MessageList>
          <MessageInput
            attachButton={false}
            placeholder="Ask a question"
            onSend={handleSend}
            style={{ padding: '15px 0' }}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
