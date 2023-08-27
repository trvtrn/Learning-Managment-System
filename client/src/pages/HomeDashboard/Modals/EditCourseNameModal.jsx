import React, { useState } from 'react';
import { Alert, Button, FormControl, FormLabel, Modal, TextField } from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';

import styles from './Modal.module.css';

export default function EditCourseNameModal({
  open,
  onClose,
  handleSubmit,
  courseId,
  courseName,
  setCourseName,
}) {
  const [errorMessage, setErrorMessage] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    if (courseName.match(/^\s*$/)) {
      setErrorMessage('Please enter a course name');
      return;
    }
    handleSubmit();
  };

  return (
    <Modal onClose={onClose} open={open} className={styles.homeModal}>
      <ColouredBox width="590px" marginSide="0px" marginTopBottom="0px" paddingSide="65px">
        <form onSubmit={onSubmit} className={styles.homeModalContainer}>
          <h3 className={styles.homeModalHeading}>
            {courseId ? 'Edit Course' : 'Create a Course'}
          </h3>
          <FormControl sx={{ marginBottom: '1rem' }}>
            <FormLabel htmlFor="course-name" className={styles.homeModalInputLabel}>
              Course Name
            </FormLabel>
            <TextField
              id="course-name"
              fullWidth
              size="small"
              value={courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
              }}
            />
          </FormControl>
          {errorMessage && (
            <Alert severity="error" className={styles.homeModalErrorMessage}>
              {errorMessage}
            </Alert>
          )}
          <div className={styles.homeModalButtonContainer}>
            <Button variant="outlined" color="primary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              {courseId ? 'Save' : 'Next'}
            </Button>
          </div>
        </form>
      </ColouredBox>
    </Modal>
  );
}
