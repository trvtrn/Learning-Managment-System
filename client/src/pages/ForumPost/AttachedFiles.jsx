import React from 'react';
import { useNavigate } from 'react-router-dom';
import FileTile from '../../components/AttachFilesInput/FileTile';
import { downloadAndSaveFile } from '../../utils/api/file';
import styles from './ForumPost.module.css';

function AttachedFiles({ files, color = 'light' }) {
  const navigate = useNavigate();
  return (
    <div className={styles.attachedFilesContainer}>
      {files.map((file) => (
        <FileTile
          key={file.fileId}
          fileName={file.fileName}
          handleDownload={() => downloadAndSaveFile(file.fileId, file.fileName, navigate)}
          small
          disableDelete
          color={color}
        />
      ))}
    </div>
  );
}

export default AttachedFiles;
