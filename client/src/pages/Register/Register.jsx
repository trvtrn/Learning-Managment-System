import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Button, Typography } from '@mui/material';

import FormInput from '../../components/LandingFormInput';

import styles from '../Login/Login.module.css';
import { isValidEmail } from '../../utils/helpers';
import { UserContext } from '../../utils/contexts';
import { register } from '../../utils/api/auth';

export default function Register() {
  const { setUserId } = useContext(UserContext);
  const [inputs, setInputs] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = React.useState('');
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/home');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      inputs.firstName.match(/^\s*$/) ||
      inputs.lastName.match(/^\s*$/) ||
      inputs.email.match(/^\s*$/) ||
      inputs.password === '' ||
      inputs.confirmPassword === ''
    ) {
      setErrorMsg("Don't leave fields empty");
      return;
    }

    if (inputs.password !== inputs.confirmPassword) {
      setErrorMsg("Passwords don't match");
      return;
    }

    if (!isValidEmail(inputs.email)) {
      setErrorMsg('Please enter a valid email');
      return;
    }

    register(inputs.firstName.trim(), inputs.lastName.trim(), inputs.email.trim(), inputs.password)
      .then((data) => {
        localStorage.setItem('token', data.token);
        setUserId(data.userId);
        navigate('/home');
      })
      .catch((err) => setErrorMsg(err.message));
  };

  return (
    <div className={styles.login}>
      <div className={styles.leftContainer}>
        <h2 className={styles.welcomeText}>WELCOME TO</h2>
        <h1 className={styles.toodles}>Toodles</h1>
        <h3 className={styles.loginText}>Make an account to start teaching and learning!</h3>
        <h4 className={styles.accountText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Click here to Login
          </Link>
        </h4>
      </div>
      <div className={styles.rightContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.rightLoginText}>Register</h2>
          <FormInput
            id="firstName"
            label="First Name"
            value={inputs.firstName}
            onChange={handleChange}
          />
          <FormInput
            id="lastName"
            label="Last Name"
            value={inputs.lastName}
            onChange={handleChange}
          />
          <FormInput
            id="email"
            label="Email"
            value={inputs.email}
            onChange={handleChange}
            type="email"
          />
          <FormInput
            id="password"
            label="Password"
            value={inputs.password}
            onChange={handleChange}
            type="password"
          />
          <FormInput
            id="confirmPassword"
            label="Confirm Password"
            value={inputs.confirmPassword}
            onChange={handleChange}
            type="password"
          />
          {errorMsg && (
            <Alert sx={{ marginTop: '1rem' }} severity="error">
              {errorMsg}
            </Alert>
          )}
          <Button
            className={styles.formButton}
            name="register-button"
            type="submit"
            variant="contained"
            color="secondary"
            sx={{ borderRadius: '50px', marginTop: '2rem', width: '50%' }}
          >
            <Typography className={styles.formButtonText}>Register</Typography>
          </Button>
        </form>
      </div>
    </div>
  );
}
