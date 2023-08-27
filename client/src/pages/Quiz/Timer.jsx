import React, { useState, useEffect } from 'react';
import { formatTime } from '../../utils/helpers';
import styles from './Quiz.module.css';

export default function Timer({ timeInSeconds, onTimeExpired }) {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    setTimeLeft(timeInSeconds);
  }, [timeInSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime === 0 && onTimeExpired) {
          onTimeExpired();
        }
        return newTime >= 0 ? newTime : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeExpired]);

  return <div className={styles.timer}>Time Left: {formatTime(timeLeft)}</div>;
}
