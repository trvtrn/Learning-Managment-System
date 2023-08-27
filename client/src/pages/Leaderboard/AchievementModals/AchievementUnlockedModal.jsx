import React from 'react';

import { Button, Modal, useTheme } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import { ACHIEVEMENT_COLORS } from '../../../utils/constants';

import styles from './Modal.module.css';

export default function AchievementUnlockedModal({
  setShowAchievementUnlockedModal,
  showAchievementUnlockedModal,
  achievementName,
  type,
}) {
  const theme = useTheme();
  return (
    <Modal
      onClose={() => setShowAchievementUnlockedModal(false)}
      open={showAchievementUnlockedModal}
      className={styles.modal}
    >
      <ColouredBox
        width="30rem"
        marginSide="0"
        marginTopBottom="0"
        paddingSide="3.5rem"
        paddingTopBottom="1.5rem"
      >
        <h3 className={styles.subheading}>Achievement Unlocked!</h3>
        <div
          className={styles.achievementUnlockedTrophy}
          style={{
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <EmojiEvents sx={{ fill: ACHIEVEMENT_COLORS[type], fontSize: '10rem' }} />
        </div>
        <p style={{ textAlign: 'center' }}>{achievementName}</p>
        <Button
          variant="outlined"
          sx={{ display: 'block', margin: '1rem auto' }}
          onClick={() => setShowAchievementUnlockedModal(false)}
        >
          Done
        </Button>
      </ColouredBox>
    </Modal>
  );
}
