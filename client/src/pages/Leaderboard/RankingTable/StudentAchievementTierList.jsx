import React from 'react';
import { useTheme } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { ACHIEVEMENT_COLORS } from '../../../utils/constants';
import styles from './RankingTable.module.css';

export default function StudentAchievementTierList({ tier, achievements }) {
  const theme = useTheme();
  return (
    <div className={styles.achievementBreakdownSection}>
      <h4
        className={styles.achievementBreakdownSubheading}
        style={{ backgroundColor: theme.palette.primary.main }}
      >
        <EmojiEvents fontSize="large" sx={{ fill: ACHIEVEMENT_COLORS[tier], display: 'block' }} />
      </h4>
      <ul className={styles.achievementBreakdownList}>
        {achievements.map((achievement) => (
          <li key={achievement.achievementCode}>
            <strong>[{achievement.achievementCode}]</strong> {achievement.achievementName}
          </li>
        ))}
      </ul>
    </div>
  );
}
