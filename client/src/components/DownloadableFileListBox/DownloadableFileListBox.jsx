import React from 'react';
import { Button } from '@mui/material';
import ColouredBox from '../ColouredBox/ColouredBox';
import DownloadableFile from './DownloadableFile';
import { downloadAndSaveFile } from '../../utils/api/file';

export default function DownloadableFileListBox({ files }) {
  return (
    <ColouredBox
      width="15rem"
      marginSide="0"
      marginTopBottom="1rem"
      color="info"
      paddingSide="1.5rem"
      paddingTopBottom="1.5rem"
    >
      {files.map((file) => (
        <DownloadableFile key={file.fileId} {...file} />
      ))}
      <Button
        variant="contained"
        color="info"
        onClick={() => {
          files.forEach((file) => downloadAndSaveFile(file.fileId, file.fileName));
        }}
        sx={{ fontSize: '0.85rem', wordWrap: 'nowrap', display: 'block', margin: '0 auto' }}
      >
        Download All
      </Button>
    </ColouredBox>
  );
}
