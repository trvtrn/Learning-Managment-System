import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Alert, CircularProgress } from '@mui/material';

import FormInput from '../../components/LandingFormInput';
import { isValidEmail } from '../../utils/helpers';
import { requestPasswordReset } from '../../utils/api/auth';

import styles from '../Login/Login.module.css';
import resetStyles from './PasswordReset.module.css';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setIsEmailSent(false);
    setEmail(e.target.value);
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email');
      return;
    }

    setLoading(true);
    requestPasswordReset(email)
      .then(() => {
        setLoading(false);
        setErrorMsg('');
        setIsEmailSent(true);
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.message);
      });
  };

  return (
    <form className={resetStyles.resetContainer} onSubmit={handleReset}>
      <h1 className={resetStyles.toodlesTitle}>Toodles</h1>
      <p className={resetStyles.infoContainer}>
        Enter the email address associated with your account and we&apos;ll send you a link to reset
        your password
      </p>
      <FormInput id="email" label="Email" value={email} onChange={handleChange} type="email" />
      {loading && <CircularProgress sx={{ marginTop: '1rem' }} />}
      {isEmailSent && (
        <Alert sx={{ marginTop: '1rem' }} severity="success">
          A reset link has been sent to your email!
        </Alert>
      )}
      {errorMsg && (
        <Alert sx={{ marginTop: '1rem' }} severity="error">
          {errorMsg}
        </Alert>
      )}
      <Button
        variant="contained"
        color="secondary"
        className={styles.formButton}
        sx={{ marginTop: '1rem' }}
        type="submit"
      >
        <span className={styles.formButtonText}>Continue</span>
      </Button>
      <h4 className={styles.accountText}>
        Don&apos;t have an account? <Link to="/register">Click here to Register</Link>
      </h4>
    </form>
  );
}
