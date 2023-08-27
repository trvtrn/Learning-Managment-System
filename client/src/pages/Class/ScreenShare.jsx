import React from 'react';
import { Button } from '@mui/material';
import styles from './Class.module.css';

export default function ScreenShare({
  videoRef,
  audioRef,
  showChat,
  hasEnteredClass,
  setHasEnteredClass,
  handleEnterClass,
  errorMessage,
}) {
  return (
    <div className={styles.screenShare} style={{ minWidth: showChat || '100vw' }}>
      {errorMessage ? (
        <span style={{ color: 'white' }}>{errorMessage}</span>
      ) : (
        hasEnteredClass || (
          <Button
            onClick={() => {
              handleEnterClass().then(() => {
                setHasEnteredClass(true);
              });
            }}
            sx={{ zIndex: 2, backgroundColor: 'white' }}
          >
            Enter Class
          </Button>
        )
      )}
      <video
        hidden={!hasEnteredClass}
        autoPlay
        muted
        ref={videoRef}
        className={styles.screenShareVideo}
        style={{ minWidth: showChat || '100vw' }}
      />
      <audio autoPlay ref={audioRef} hidden />
    </div>
  );
}
