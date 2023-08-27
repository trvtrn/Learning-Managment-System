import React from 'react';

import { Button } from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';

import styles from './Modal.module.css';
import { ACHIEVEMENT_COLORS } from '../../../utils/constants';
import CopyButton from '../../../components/CopyButton';

const NewAchievementModal = React.forwardRef(function NewAchievementModal(
  { name, type, code, toggleShowEditModal },
  ref
) {
  return (
    <ColouredBox
      marginSide="0"
      marginTopBottom="0"
      paddingSide="3rem"
      paddingTopBottom="1.5rem"
      maxWidth="calc(min(800px, 100vw))"
      ref={ref}
    >
      <div className={styles.modalInnerContainer}>
        <h3 className={styles.subheading}>New Achievement Code</h3>
        <h4 className={styles.medalHeading}>{name}</h4>
        <div className={styles.codeContainer}>
          <div className={styles.outlineBox} style={{ borderColor: ACHIEVEMENT_COLORS[type] }}>
            {code}
          </div>
          <div style={{ marginLeft: '1rem', transform: 'translateX(50%)' }}>
            <CopyButton text={code} />
          </div>
        </div>
        <Button variant="contained" color="primary" onClick={toggleShowEditModal}>
          Done
        </Button>
      </div>
    </ColouredBox>
  );
});
export default NewAchievementModal;
