import React from 'react';
import { Divider, useTheme } from '@mui/material';
import { Person } from '@mui/icons-material';
import styles from './Participants.module.css';

export default function ParticpantSection({ participants, label }) {
  const theme = useTheme();
  return (
    <>
      <h3
        className={styles.participantsHeading}
        style={{ backgroundColor: theme.palette.custom.paleBlue }}
      >
        {label} ({participants.length})
      </h3>
      <Divider />
      <ul className={styles.participantList}>
        {participants.map((participant) => (
          <li key={participant.userId} className={styles.participantName}>
            <Person fontSize="small" />
            {participant.firstName} {participant.lastName}
          </li>
        ))}
      </ul>
    </>
  );
}
