import React, { useState } from 'react';
import { Modal, Button, OutlinedInput, Alert } from '@mui/material';
import ColouredBox from './ColouredBox/ColouredBox';

export default function DeleteWarningModal({
  isImportant,
  expectedInput,
  action = 'delete',
  helperText = 'this item',
  setShowModal,
  handleDelete,
}) {
  const [input, setInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  return (
    <Modal
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      open
      onClose={() => setShowModal(false)}
    >
      <ColouredBox width="500px" margin="0 auto">
        <p style={{ marginTop: 0, textAlign: 'center' }}>
          Are you sure you want to {action} {helperText}?
        </p>
        <p style={{ textAlign: 'center' }}>
          <strong>This action cannot be reversed!</strong>
        </p>
        {isImportant && (
          <>
            <p style={{ textAlign: 'center' }}>
              Type <strong>{expectedInput}</strong> to continue.
            </p>
            <OutlinedInput
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              sx={{ marginBottom: '1rem' }}
            />
            {errorMessage && (
              <Alert severity="error" sx={{ marginBottom: '1rem' }}>
                {errorMessage}
              </Alert>
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={(e) => {
              e.preventDefault();
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
              if (isImportant && input !== expectedInput) {
                setErrorMessage('Your input does not match the expected input');
                return;
              }
              setErrorMessage('');
              setShowModal(false);
              handleDelete(e);
            }}
          >
            {action[0].toUpperCase() + action.slice(1)}
          </Button>
        </div>
      </ColouredBox>
    </Modal>
  );
}
