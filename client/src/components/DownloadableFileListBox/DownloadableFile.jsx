import React from 'react';
import { Button } from '@mui/material';
import { TextSnippet } from '@mui/icons-material';
import { downloadAndSaveFile } from '../../utils/api/file';

export default function DownloadableFile({ fileId, fileName, handleClick }) {
  return (
    <Button
      sx={{
        maxHeight: '100px',
        maxWidth: '100%',
        fontSize: '0.75rem',
        padding: '5px',
        wordBreak: 'break-all',
        borderRadius: '0',
        marginBottom: '1.5rem',
        width: '100%',
        justifyContent: 'flex-start',
      }}
      onClick={() => downloadAndSaveFile(fileId, fileName)}
    >
      <TextSnippet sx={{ marginRight: '1rem' }} />
      {fileName}
    </Button>
  );
}
