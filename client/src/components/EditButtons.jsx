import React, { useState } from 'react';
import { IconButton, useTheme } from '@mui/material';
import { EditOutlined, Delete } from '@mui/icons-material';
import DeleteWarningModal from './DeleteWarningModal';

export default function EditButtons({
  handleEdit,
  handleDelete,
  fontSize = 'large',
  helperText = 'this item',
}) {
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  return (
    <div style={{ minWidth: 'fit-content', display: 'flex', flexWrap: 'nowrap' }}>
      <IconButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEdit(e);
        }}
      >
        <EditOutlined fontSize={fontSize} sx={{ fill: theme.palette.custom.defaultFont }} />
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        <Delete fontSize={fontSize} sx={{ fill: theme.palette.custom.defaultFont }} />
      </IconButton>
      {showModal && (
        <DeleteWarningModal
          helperText={helperText}
          handleDelete={handleDelete}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
}
