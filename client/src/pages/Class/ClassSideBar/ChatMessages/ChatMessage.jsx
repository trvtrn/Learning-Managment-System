import React, { useContext } from 'react';
import { Divider, useTheme } from '@mui/material';

import { UserContext } from '../../../../utils/contexts';

import styles from './ChatMessages.module.css';

export default function ChatMessage({ senderId, senderName, messages, isLast, messageRef }) {
  const { userId } = useContext(UserContext);
  const theme = useTheme();
  return (
    <>
      <div
        className={styles.messageContainer}
        style={{
          backgroundColor: userId === senderId && theme.palette.custom.paleBlue,
        }}
      >
        <span className={styles.senderName}>
          <strong>{senderName}</strong>
        </span>
        {messages.map((message) => (
          <p
            key={message.messageId}
            ref={isLast ? messageRef : null}
            className={styles.messageText}
          >
            {message.message}
          </p>
        ))}
      </div>
      {isLast || <Divider />}
    </>
  );
}
