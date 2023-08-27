import React, { useState } from 'react';
import { Alert, Button } from '@mui/material';
import DeleteWarningModal from '../DeleteWarningModal';
import styles from './FormFooter.module.css';

export default function FormFooter({ errorMessage, onCancel }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className={styles.formFooter}>
      {errorMessage && (
        <Alert className={styles.alertContainer} severity="error">
          {errorMessage}
        </Alert>
      )}
      <Button variant="outlined" color="primary" onClick={() => setShowModal(true)}>
        Cancel
      </Button>
      <Button type="submit" variant="contained" color="primary">
        Save
      </Button>
      {showModal && (
        <DeleteWarningModal
          action="discard"
          helperText="unsaved changes"
          handleDelete={onCancel}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
}
