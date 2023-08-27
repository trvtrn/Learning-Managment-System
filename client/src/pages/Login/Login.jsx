import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Button } from '@mui/material';

import FormInput from '../../components/LandingFormInput';

import styles from './Login.module.css';
import { isValidEmail } from '../../utils/helpers';
import { UserContext } from '../../utils/contexts';
import { login } from '../../utils/api/auth';

export default function Login() {
  const { userId, setUserId } = useContext(UserContext);
  const [inputs, setInputs] = React.useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = React.useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (userId) {
      navigate('/home');
    }
  }, [userId, navigate]);

  const handleChange = (e) => {
    setInputs((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.values(inputs).some((input) => input.match(/^\s*$/))) {
      setErrorMsg("Don't leave a field empty");
      return;
    }

    if (!isValidEmail(inputs.email)) {
      setErrorMsg('Please enter a valid email');
      return;
    }

    login(inputs.email, inputs.password)
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
        <h2 className={styles.welcomeText}>
          WELCOME
          <br />
          BACK TO
        </h2>
        <h1 className={styles.toodles}>Toodles</h1>
        <h3 className={styles.loginText}>Login to access your courses</h3>
        <h4 className={styles.accountText}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className={styles.link}>
            Click here to Register
          </Link>
        </h4>
      </div>
      <div className={styles.rightContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.rightLoginText}>Login</h2>
          <FormInput
            label="Email"
            id="email"
            value={inputs.email}
            onChange={handleChange}
            type="email"
          />
          <FormInput
            label="Password"
            id="password"
            value={inputs.password}
            onChange={handleChange}
            type="password"
          />
          {errorMsg && (
            <Alert sx={{ marginTop: '1rem' }} severity="error">
              {errorMsg}
            </Alert>
          )}
          <Button
            sx={{ borderRadius: '50px', marginTop: '2rem', width: '50%' }}
            name="login-button"
            type="submit"
            variant="contained"
            color="secondary"
          >
            <span className={styles.formButtonText}>Login</span>
          </Button>
        </form>
        <h4 className={styles.resetText}>
          Forgot Password? <Link to="/reset">Click here to reset</Link>
        </h4>
      </div>
    </div>
  );
}
