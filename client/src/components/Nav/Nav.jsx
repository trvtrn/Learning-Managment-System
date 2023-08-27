import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import '@fontsource/museomoderno';
import { useTheme } from '@mui/material';
import { UserContext } from '../../utils/contexts';

import styles from './Nav.module.css';

function Nav() {
  const navigate = useNavigate();
  const { setUserId, setEmail, setFirstName, setLastName } = useContext(UserContext);
  const theme = useTheme();

  const logout = () => {
    localStorage.clear();
    navigate('/login');
    setUserId();
    setEmail();
    setFirstName();
    setLastName();
  };

  return (
    <Box className={styles.navContainer}>
      <AppBar>
        <Toolbar className={styles.toolbar}>
          <Link to="/home" className={styles.homeLink}>
            <Typography
              variant="h4"
              align="center"
              component="h1"
              sx={{
                fontWeight: 'bold',
                fontFamily: 'museomoderno',
                letterSpacing: 3,
                width: 'fit-content',
                color: theme.palette.custom.background,
              }}
            >
              Toodles
            </Typography>
          </Link>
          <IconButton
            size="large"
            edge="end"
            aria-label="logout"
            color="inherit"
            onClick={logout}
            sx={{ position: 'absolute', right: '0.5rem' }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Nav;
