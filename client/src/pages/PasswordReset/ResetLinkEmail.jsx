import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Alert, CircularProgress } from '@mui/material';

import FormInput from '../../components/LandingFormInput';

import styles from '../Login/Login.module.css';
import resetStyles from './PasswordReset.module.css';
import { resetPassword } from '../../utils/api/auth';

export default function ResetLinkEmail() {
  const [inputs, setInputs] = useState({ password: '', confirmPassword: '' });
  const [isRequestSuccessful, setIsRequestSuccessful] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  const handleChange = (e) => {
    setIsRequestSuccessful(false);
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReset = (e) => {
    e.preventDefault();

    if (Object.values(inputs).some((input) => input.match(/^\s*$/))) {
      setErrorMsg("Don't leave a field empty");
      return;
    }
    if (inputs.password !== inputs.confirmPassword) {
      setErrorMsg("Passwords don't match");
      return;
    }

    setLoading(true);
    resetPassword(userId, token, inputs.password)
      .then(() => {
        setLoading(false);
        setErrorMsg('');
        setIsRequestSuccessful(true);
      })
      .catch((err) => {
        setLoading(false);
        setErrorMsg(err.message);
      });
  };

  return (
    <form className={resetStyles.resetContainer} onSubmit={handleReset}>
      <h1 className={resetStyles.toodlesTitle}>Toodles</h1>
      <p className={resetStyles.infoContainer}>Enter a New Pasword</p>
      <FormInput
        id="password"
        label="New Password"
        value={inputs.password}
        onChange={handleChange}
        type="password"
      />
      <FormInput
        id="confirmPassword"
        label="Confirm New Password"
        value={inputs.confirmPassword}
        onChange={handleChange}
        type="password"
      />
      {loading && <CircularProgress sx={{ marginTop: '1rem' }} />}
      {isRequestSuccessful && (
        <Alert sx={{ marginTop: '1rem' }} severity="success">
          You have successfully set your new password
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
        <span className={styles.formButtonText}>Set New Password</span>
      </Button>
      <h4 className={styles.accountText}>
        Finished? <Link to="/login">Click here to Login</Link>
      </h4>
    </form>
  );
}
