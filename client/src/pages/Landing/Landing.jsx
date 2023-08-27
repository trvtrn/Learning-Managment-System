import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      navigate('/home');
    }
  }, [navigate]);
  return (
    <div className={styles.landing}>
      <CircularProgress />
    </div>
  );
}
