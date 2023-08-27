import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Modal } from '@mui/material';
import { saveFile } from '../../../utils/api/file';

import styles from './AssignmentModal.module.css';
import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import UploadFileTile from '../../../components/AttachFilesInput/UploadFileTile';
import FileTile from '../../../components/AttachFilesInput/FileTile';
import { updateAssignmentSubmission } from '../../../utils/api/assignments';

export default function SubmissionModal({ toggle, getSubmissionDetails }) {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (files.length === 0) {
      return;
    }
    setSubmission(files[0]);
    setFiles([]);
  }, [files]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submission === null) {
      return;
    }
    updateAssignmentSubmission(assignmentId, submission, navigate)
      .then(() => {
        getSubmissionDetails();
        toggle();
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  return (
    <Modal onClose={toggle} open className={styles.modal}>
      <ColouredBox
        width="20rem"
        marginSide="0"
        marginTopBottom="0"
        paddingSide="2rem"
        paddingTopBottom="1.5rem"
      >
        <div className={styles.modalInnerContainer}>
          <h3 className={styles.subheading}>Choose File to Upload</h3>
          <form onSubmit={handleSubmit} className={styles.modalContainer}>
            <UploadFileTile id="upload" setFiles={setFiles} />
            {submission !== null && (
              <FileTile
                small
                disableDelete
                fileName={submission.name}
                handleDownload={() => saveFile(submission, submission.name)}
              />
            )}
            <Button variant="contained" color="primary" sx={{ fontSize: '1rem' }} type="submit">
              Submit
            </Button>
          </form>
        </div>
      </ColouredBox>
    </Modal>
  );
}
