import React from 'react';
import { Link } from 'react-router-dom';
import { ListItem, Divider, useTheme, ListItemButton } from '@mui/material';

import styles from './SideBar.module.css';

export default function SideBarItem({ icon, label, path }) {
  const theme = useTheme();
  return (
    <>
      <Divider sx={{ margin: '0 auto', width: '80%' }} />
      <ListItem disablePadding>
        <Link
          to={`/${path}`}
          style={{
            textDecoration: 'none',
            color: theme.palette.custom.defaultFont,
          }}
        >
          <ListItemButton sx={{ padding: '0.4rem 0' }}>
            <div className={styles.sideBarItemContainer}>
              {React.cloneElement(icon, {
                className: styles.sideBarIcon,
                fontSize: 'large',
                sx: { color: theme.palette.custom.defaultFont },
              })}
              <div className={styles.sideBarSubheading}>{label}</div>
            </div>
          </ListItemButton>
        </Link>
      </ListItem>
    </>
  );
}
