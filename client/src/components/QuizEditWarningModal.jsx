import React from 'react';
import { Modal, Button } from '@mui/material';
import ColouredBox from './ColouredBox/ColouredBox';

export default function QuizEditWarningModal({ name, setShowModal, onConfirm }) {
  return (
    <Modal
      open
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      onClose={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(false);
      }}
    >
      <ColouredBox width="500px">
        <span style={{ display: 'block', textAlign: 'center', marginBottom: '1rem' }}>
          Editing quiz <strong>{name}</strong> will remove all existing submissions. <br />
          <br />
          Are you sure you want to proceed?
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm(e);
            }}
          >
            Proceed
          </Button>
        </div>
      </ColouredBox>
    </Modal>
  );
}
