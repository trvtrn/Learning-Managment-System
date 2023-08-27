import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import styles from './SubmissionBox.module.css';
import ResultsModal from './ResultsModal';
import { UserContext } from '../../../utils/contexts';
import SubmissionModal from './SubmissionModal';
import DownloadableFile from '../../../components/DownloadableFileListBox/DownloadableFile';
import { getAssignmentSubmission } from '../../../utils/api/assignments';

export default function SubmissionBox({ pastDeadline, marksReleased, totalMarks }) {
  const { userId } = useContext(UserContext);
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [openSubmissionModal, setOpenSubmissionModal] = useState(false);
  const [openResultsModal, setOpenResultsModal] = useState(false);

  const [fileId, setFileId] = useState(null);
  const [submissionName, setSubmissionName] = useState(null);
  const [grade, setGrade] = useState('?');
  const [comment, setComment] = useState(null);

  const toggleSubmissionModal = () => {
    setOpenSubmissionModal(!openSubmissionModal);
  };

  const toggleResultsModal = () => {
    setOpenResultsModal(!openResultsModal);
  };

  const getSubmissionDetails = () => {
    if (!userId) {
      return;
    }
    getAssignmentSubmission(assignmentId, userId, navigate)
      .then((data) => {
        if (data.files.length > 0) {
          setSubmissionName(data.files[0].fileName);
          setFileId(data.files[0].fileId);
        }

        if (!marksReleased) {
          return;
        }

        setGrade(data.mark);
        setComment(data.comment);
      })
      .catch((err) => console.error(err.message));
  };

  useEffect(getSubmissionDetails, [marksReleased, userId, assignmentId, navigate]);

  return (
    <ColouredBox
      width="15rem"
      marginSide="0"
      marginTopBottom="1rem"
      color="info"
      paddingSide="0"
      paddingTopBottom="0"
    >
      <div className={styles.boxContainer}>
        <h5 className={styles.grade}>
          Grade: {marksReleased && pastDeadline && grade !== null ? grade : '?'} / {totalMarks}
        </h5>
        {submissionName === null ? (
          <h6 className={styles.submissionName}>No Submission Added</h6>
        ) : (
          <DownloadableFile fileId={fileId} fileName={submissionName} />
        )}
        {marksReleased && pastDeadline ? (
          <Button
            variant="contained"
            color="info"
            onClick={toggleResultsModal}
            sx={{ fontSize: '1rem' }}
          >
            Feedback
          </Button>
        ) : (
          <Button
            variant="contained"
            color="info"
            onClick={toggleSubmissionModal}
            sx={{ fontSize: '1rem' }}
            disabled={pastDeadline}
          >
            Upload
          </Button>
        )}
        {openSubmissionModal && (
          <SubmissionModal
            toggle={toggleSubmissionModal}
            getSubmissionDetails={getSubmissionDetails}
          />
        )}
        {openResultsModal && (
          <ResultsModal
            toggle={toggleResultsModal}
            grade={grade}
            totalMarks={totalMarks}
            comment={comment}
          />
        )}
      </div>
    </ColouredBox>
  );
}
