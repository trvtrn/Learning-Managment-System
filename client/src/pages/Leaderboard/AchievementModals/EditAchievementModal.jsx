import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Modal, TextField, MenuItem, Alert, useTheme } from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import NewAchievementModal from './NewAchievementModal';

import styles from './Modal.module.css';
import { editAchievement, generateNewCode } from '../../../utils/api/leaderboard';

const TIERS = ['Bronze', 'Silver', 'Gold'];

export default function EditAchievementModal({
  toggleShowEditModal,
  existingAchievementCode,
  existingAchievementName,
  existingAchievementType,
  refreshAchievements,
  refreshRankings,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { courseId } = useParams();
  const [achievementName, setAchievementName] = useState(existingAchievementName || '');
  const [achievementType, setAchievementType] = useState(existingAchievementType || 'Bronze');
  const [achievementCode, setAchievementCode] = useState(existingAchievementCode || '');
  const [errorMessage, setErrorMessage] = useState('');

  const [showNewAchievementModal, setShowNewAchievementModal] = useState(false);
  const toggleNewAchievementModal = useCallback(() => {
    setShowNewAchievementModal((prev) => !prev);
  }, []);

  const handleSubmit = () => {
    if (achievementName.match(/^\s*$/)) {
      setErrorMessage('Achievement cannot be empty');
    } else if (!existingAchievementCode) {
      generateNewCode(courseId, achievementName.trim(), achievementType, navigate)
        .then((data) => {
          setAchievementCode(data.achievementCode);
          toggleNewAchievementModal();
          refreshAchievements();
          refreshRankings();
        })
        .catch((err) => {
          setErrorMessage(errorMessage);
          console.error(err.message);
        });
    } else {
      editAchievement(
        courseId,
        existingAchievementCode,
        achievementName,
        achievementType,
        navigate
      ).then(() => {
        toggleShowEditModal();
        refreshAchievements();
        refreshRankings();
      });
    }
  };

  return (
    <Modal onClose={toggleShowEditModal} open className={styles.modal}>
      <>
        {showNewAchievementModal || (
          <ColouredBox
            width="30rem"
            marginSide="0"
            marginTopBottom="0"
            paddingSide="1.5rem"
            paddingTopBottom="1.5rem"
          >
            <form className={styles.modalInnerContainer}>
              <h3 className={styles.subheading}>
                {existingAchievementCode ? 'Edit Achievement' : 'Create New Achievement'}
              </h3>
              <div
                className={styles.backgroundBox}
                style={{ backgroundColor: theme.palette.custom.purple }}
              >
                <TextField
                  id="new-achievement"
                  label="Achievement"
                  value={achievementName}
                  onChange={(e) => {
                    setAchievementName(e.target.value);
                  }}
                  sx={{
                    width: '15rem',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    margin: '1rem 0',
                  }}
                />
                <TextField
                  select
                  id="achievementTier"
                  label="Tier"
                  value={achievementType}
                  onChange={(e) => {
                    setAchievementType(e.target.value);
                  }}
                  sx={{
                    width: '8rem',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                  }}
                >
                  {TIERS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              {errorMessage && (
                <Alert severity="error" sx={{ marginBottom: '1rem' }}>
                  {errorMessage}
                </Alert>
              )}
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                {existingAchievementCode ? 'Save' : 'Generate Code'}
              </Button>
            </form>
          </ColouredBox>
        )}
        {showNewAchievementModal && (
          <NewAchievementModal
            name={achievementName}
            code={achievementCode}
            type={achievementType}
            toggleShowEditModal={toggleShowEditModal}
          />
        )}
      </>
    </Modal>
  );
}
