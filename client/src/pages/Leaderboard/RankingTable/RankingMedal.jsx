import React from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { ACHIEVEMENT_COLORS } from '../../../utils/constants';

import styles from './RankingTable.module.css';

export default function AchievementCount({ type, number }) {
  return (
    <div className={styles.medal}>
      <h5 className={styles.medalCount}>{number}</h5>
      <EmojiEventsIcon fontSize="large" sx={{ color: ACHIEVEMENT_COLORS[type] }} />
    </div>
  );
}
