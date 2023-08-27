import React, { useState, useEffect, useRef } from 'react';
import { OutlinedInput, IconButton, FormControl, useTheme } from '@mui/material';
import { Send } from '@mui/icons-material';

import ChatMessage from './ChatMessage';
import { groupMessages } from '../../../../utils/helpers';

import styles from './ChatMessages.module.css';

export default function ChatMessages({ classId, wsRef, messages, hasEnteredClass }) {
  const theme = useTheme();
  const lastMessageRef = useRef(null);
  const groupedMessages = groupMessages(messages);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Always keep the last message in sight
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView();
    }
  }, [messages, classId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!wsRef.current || message.match(/^\s*$/)) {
      return;
    }
    setMessage('');
    wsRef.current.send(
      JSON.stringify({
        type: 'message',
        text: message.trim(),
      })
    );
  };

  return (
    <>
      <div className={styles.messagesContainer}>
        {groupedMessages.map((messageInfo, idx) => (
          <ChatMessage
            key={idx}
            senderId={messageInfo.senderId}
            senderName={`${messageInfo.senderFirstName} ${messageInfo.senderLastName}`}
            messages={messageInfo.messages}
            isLast={idx === groupedMessages.length - 1}
            messageRef={lastMessageRef}
          />
        ))}
      </div>
      <form
        onSubmit={sendMessage}
        className={styles.chatForm}
        style={{ backgroundColor: theme.palette.custom.neutralBackground }}
      >
        <FormControl fullWidth>
          <OutlinedInput
            multiline
            id="message"
            value={message}
            autoCorrect="off"
            disabled={!hasEnteredClass}
            size="small"
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            inputProps={{
              style: { fontSize: 'var(--normalText)', lineHeight: '1rem' },
            }}
            fullWidth
            sx={{ backgroundColor: theme.palette.custom.background }}
            endAdornment={
              <IconButton type="submit" size="small">
                <Send sx={{ fontSize: '1rem' }} />
              </IconButton>
            }
          />
        </FormControl>
      </form>
    </>
  );
}
