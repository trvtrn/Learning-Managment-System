import React from 'react';
import { Button, Card, IconButton, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import styles from './AttachFilesInput.module.css';

export default function FileTile({
  fileName,
  handleDelete,
  handleDownload,
  small,
  disableDelete,
  color = 'light',
}) {
  const theme = useTheme();
  const cardStyles = small
    ? {
        height: '2rem',
        width: 'fit-content',
        maxWidth: '10rem',
        justifyContent: 'flex-start',
      }
    : { height: '6rem', width: '7rem' };
  const buttonStyles = small
    ? {
        width: 'fit-content',
        marginRight: disableDelete ? 0 : '1.8rem',
        maxWidth: disableDelete ? '100%' : '80%',
        padding: `0.4rem ${disableDelete ? '0.7rem' : '0.4rem'}`,
        whiteSpace: 'nowrap',
        justifyContent: 'flex-start',
      }
    : {
        padding: '0 1rem',
        width: '100%',
      };
  const textStyles = small
    ? {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        textAlign: disableDelete ? 'center' : 'left',
      }
    : {
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-all',
      };
  return (
    <Card
      className={styles.fileBox}
      sx={{
        boxShadow: 'none',
        border: '3px solid',
        borderColor: theme.palette.custom[color],
        ...cardStyles,
      }}
    >
      <Button
        onClick={handleDownload}
        sx={{
          borderRadius: '0',
          minWidth: '0',
          height: '100%',
          fontWeight: 400,
          overflow: 'hidden',
          fontSize: '0.75rem',
          ...buttonStyles,
        }}
      >
        <span
          style={{
            width: '100%',
            fontSize: '0.7rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...textStyles,
          }}
        >
          {fileName}
        </span>
      </Button>
      {disableDelete || (
        <IconButton sx={{ position: 'absolute', top: 0, right: 0 }} onClick={handleDelete}>
          <Close sx={{ fontSize: '1rem' }} />
        </IconButton>
      )}
    </Card>
  );
}
