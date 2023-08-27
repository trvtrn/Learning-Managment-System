import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert, Button, Modal, useTheme } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';

import styles from './Modal.module.css';
import { awardAchievement } from '../../../utils/api/leaderboard';
import AwardAchievementTable from './AwardAchievementTable';
import { ACHIEVEMENT_COLORS } from '../../../utils/constants';

export default function AwardAchievementModal({
  code,
  type,
  name,
  toggleShowAwardModal,
  refreshRankings,
  membersNotAwarded,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { courseId } = useParams();

  const [awardees, setAwardees] = useState(new Set());

  const [errorMessage, setErrorMessage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    Promise.all(
      Array.from(awardees).map((email) => awardAchievement(courseId, email, code, navigate))
    )
      .then(() => {
        toggleShowAwardModal();
        refreshRankings();
      })
      .catch((err) => setErrorMessage(err.message));
  };

  return (
    <Modal onClose={toggleShowAwardModal} open className={styles.modal}>
      <ColouredBox
        width="30rem"
        marginSide="0"
        marginTopBottom="0"
        paddingSide="1.5rem"
        paddingTopBottom="1.5rem"
      >
        <form className={styles.modalInnerContainer} onSubmit={handleSubmit}>
          <h3 className={styles.subheading}>Award Students</h3>
          <div
            className={styles.achievementHeading}
            style={{ backgroundColor: theme.palette.primary.main }}
          >
            <EmojiEvents
              sx={{ fill: ACHIEVEMENT_COLORS[type], display: 'block', fontSize: '2rem' }}
            />
          </div>
          <span>{name}</span>
          <div
            className={styles.backgroundBox}
            style={{
              backgroundColor: theme.palette.custom.purple,
            }}
          >
            <AwardAchievementTable
              membersNotAwarded={membersNotAwarded}
              awardees={awardees}
              setAwardees={setAwardees}
            />
          </div>
          {errorMessage && (
            <Alert severity="error" sx={{ marginBottom: '1rem' }}>
              {errorMessage}
            </Alert>
          )}
          {awardees.size === 0 ? (
            <Button variant="outlined" onClick={toggleShowAwardModal}>
              Cancel
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmit}>
              Award
            </Button>
          )}
        </form>
      </ColouredBox>
    </Modal>
  );
}
