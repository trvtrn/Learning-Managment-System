import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert, Button, TextField } from '@mui/material';

import styles from './RedeemCodeInput.module.css';
import { unlockAchievement } from '../../../utils/api/leaderboard';
import AchievementUnlockedModal from '../AchievementModals/AchievementUnlockedModal';

export default function CodeInput({ refreshRankings, refreshAchievements }) {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [code, setCode] = useState('');
  const [achievement, setAchievement] = useState({});
  const [showAchievementUnlockedModal, setShowAchievementUnlockedModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.toUpperCase().match(/^[A-Z0-9]{4}$/)) {
      setErrorMessage('Invalid code format');
      return;
    }
    setCode('');
    unlockAchievement(courseId, code.toUpperCase(), navigate)
      .then((newAchievement) => {
        setAchievement(newAchievement);
        setShowAchievementUnlockedModal(true);
        refreshRankings();
        refreshAchievements();
      })
      .catch((err) => {
        setErrorMessage(err.message);
        console.error(err.message);
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.container}>
        <Alert
          severity="error"
          style={{ visibility: errorMessage ? 'visible' : 'hidden' }}
          sx={{ marginBottom: '1rem' }}
        >
          {errorMessage}
        </Alert>
        <TextField
          label="Enter Code"
          id="achievement code input"
          size="medium"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
          inputProps={{ style: { textAlign: 'center' } }}
          sx={{ backgroundColor: 'white', marginRight: '1rem' }}
        />
        <Button variant="contained" color="info" onClick={handleSubmit}>
          Unlock
        </Button>
      </form>
      <AchievementUnlockedModal
        {...achievement}
        setShowAchievementUnlockedModal={setShowAchievementUnlockedModal}
        showAchievementUnlockedModal={showAchievementUnlockedModal}
      />
    </>
  );
}
