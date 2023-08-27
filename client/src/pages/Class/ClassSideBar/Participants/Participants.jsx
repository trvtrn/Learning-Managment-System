import React from 'react';
import { Divider } from '@mui/material';

import ParticpantSection from './ParticipantSection';

import styles from './Participants.module.css';

export default function Participants({ participants }) {
  return (
    <div className={styles.participantsContainer}>
      <ParticpantSection
        label="Educators"
        participants={participants.filter(({ role }) => role === 'Educator' || role === 'Creator')}
      />
      <Divider />
      <ParticpantSection
        label="Students"
        participants={participants.filter(({ role }) => role !== 'Educator' && role !== 'Creator')}
      />
    </div>
  );
}
