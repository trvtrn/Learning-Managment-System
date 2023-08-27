import React from 'react';
import { useTheme } from '@mui/material';
import StudentAchievementTierList from './StudentAchievementTierList';
import styles from './RankingTable.module.css';

export default function StudentAchievementBreakdown({ firstName, achievements }) {
  const theme = useTheme();
  return (
    <div style={{ backgroundColor: theme.palette.custom.purple, borderRadius: '5px' }}>
      <h3 className={styles.achievementBreakdownHeading}>{firstName}&apos;s Achievements</h3>
      <div className={styles.achievementBreakdownContainer}>
        <StudentAchievementTierList
          tier="Gold"
          achievements={achievements.filter(({ type }) => type === 'Gold')}
        />
        <StudentAchievementTierList
          tier="Silver"
          achievements={achievements.filter(({ type }) => type === 'Silver')}
        />
        <StudentAchievementTierList
          tier="Bronze"
          achievements={achievements.filter(({ type }) => type === 'Bronze')}
        />
      </div>
    </div>
  );
}
