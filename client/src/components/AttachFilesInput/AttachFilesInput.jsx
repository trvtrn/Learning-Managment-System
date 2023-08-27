import React from 'react';
import EditorFormInputBase from '../EditorFormInputBase';
import UploadFileTile from './UploadFileTile';
import FileTile from './FileTile';
import { saveFile } from '../../utils/api/file';
import styles from './AttachFilesInput.module.css';

export default function AttachFilesInput({
  label = 'Attach Files',
  id = 'upload',
  files,
  setFiles,
  small,
}) {
  const handleDownload = (file) => saveFile(file, file.name);
  const handleDelete = (file) => setFiles((prev) => prev.filter((prevFile) => prevFile !== file));
  const filesComponent = (
    <>
      <UploadFileTile id={id} setFiles={setFiles} small={small} />
      {files.map((file, idx) => {
        return (
          <FileTile
            key={idx}
            fileName={file.name}
            handleDownload={() => handleDownload(file)}
            handleDelete={() => handleDelete(file)}
            small={small}
          />
        );
      })}
    </>
  );

  return (
    <EditorFormInputBase label={label} htmlFor={id} small={small} inline={small}>
      {small ? (
        filesComponent
      ) : (
        <div
          className={styles.attachFilesContainer}
          style={{
            display: 'flex',
            flex: 1,
            gap: '1.2rem',
          }}
        >
          {filesComponent}
        </div>
      )}
    </EditorFormInputBase>
  );
}
