import React from 'react';
import { Card, IconButton, useTheme } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import styles from './AttachFilesInput.module.css';

export default function UploadFileTile({ id, setFiles, small }) {
  const theme = useTheme();
  const cardStyle = small ? { height: '2rem', width: '2rem' } : { height: '6rem', width: '7rem' };
  return (
    <Card
      className={styles.fileBox}
      sx={{
        boxShadow: 'none',
        border: '3px solid',
        borderColor: theme.palette.custom.light,
        ...cardStyle,
      }}
    >
      <IconButton
        sx={{ cursor: 'pointer', height: '100%', width: '100%', borderRadius: '0', padding: '0' }}
        size={small ? 'small' : 'large'}
      >
        <label className={styles.uploadFileLabel} htmlFor="upload">
          <UploadFile fontSize={small ? 'small' : 'large'} />
          <input
            id={id}
            accept="image/*,.txt,.pdf"
            type="file"
            value=""
            style={{ display: 'none' }}
            onChange={(e) => {
              e.preventDefault();
              setFiles((prev) => [...prev, ...e.target.files]);
            }}
          />
        </label>
      </IconButton>
    </Card>
  );
}
