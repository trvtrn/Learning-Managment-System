import React from 'react';
import { Outlet } from 'react-router-dom';

import Nav from '../../components/Nav/Nav';

import styles from './NavLayout.module.css';

export default function NavLayout({ children }) {
  return (
    <div className={styles.pageContainer}>
      <Nav />
      <div className={styles.innerPageContainer}>{children || <Outlet />}</div>
    </div>
  );
}
