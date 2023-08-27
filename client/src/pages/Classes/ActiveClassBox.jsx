import React from 'react';
import { Button } from '@mui/material';

import ColouredBox from '../../components/ColouredBox/ColouredBox';
import { toTimeString } from '../../utils/helpers';

import styles from './Classes.module.css';

function ActiveClassBox({ classId, name, startTime, endTime }) {
  return (
    <ColouredBox
      height="fit"
      color="info"
      marginTopBottom="1rem"
      marginSide="0"
      paddingTopBottom="25px"
    >
      <div className={styles.classBox}>
        <div>
          <h3 className={styles.classLabel}>{name}</h3>
          <span className={styles.time}>
            <strong>
              {toTimeString(startTime)} - {toTimeString(endTime)}
            </strong>
          </span>
        </div>
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            window.open(`/class/${classId}`, '_blank', 'rel=noopener noreferrer');
          }}
        >
          Join Now
        </Button>
      </div>
    </ColouredBox>
  );
}

export default ActiveClassBox;
