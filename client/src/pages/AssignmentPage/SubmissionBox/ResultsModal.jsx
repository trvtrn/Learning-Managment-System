import React from 'react';

import { Button, Modal, useTheme } from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';

import styles from './AssignmentModal.module.css';

export default function ResultsModal({ toggle, grade, totalMarks, comment }) {
  const theme = useTheme();
  return (
    <Modal onClose={toggle} open={toggle} className={styles.modal}>
      <ColouredBox
        width="60%"
        marginSide="0"
        marginTopBottom="0"
        paddingSide="1.5rem"
        paddingTopBottom="1.5rem"
      >
        <div className={styles.modalInnerContainer}>
          <h3 className={styles.subheading}>Assignment Feedback</h3>
          <h5 className={styles.grade}>
            Grade: {grade || '?'} / {totalMarks || '?'}
          </h5>
          <div
            className={styles.commentBox}
            style={{ backgroundColor: theme.palette.custom.light }}
          >
            {comment || 'Comment not provided'}
          </div>
          <Button variant="contained" color="primary" onClick={toggle}>
            Close
          </Button>
        </div>
      </ColouredBox>
    </Modal>
  );
}
