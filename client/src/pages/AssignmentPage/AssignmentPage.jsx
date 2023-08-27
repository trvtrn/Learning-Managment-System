import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import EditButtons from '../../components/EditButtons';
import ColouredBox from '../../components/ColouredBox/ColouredBox';
import SubmissionTable from './SubmissionTable/SubmissionTable';
import SubmissionBox from './SubmissionBox/SubmissionBox';
import RichTextBox from '../../components/RichTextBox/RichTextBox';
import DownloadableFileListBox from '../../components/DownloadableFileListBox/DownloadableFileListBox';
import { formatDate } from '../../utils/helpers';
import { deleteAssignment, getAssignment } from '../../utils/api/assignments';
import { CourseContext } from '../../utils/contexts';

import globalStyles from '../../index.module.css';
import styles from './AssignmentPage.module.css';

export default function AssignmentPage() {
  const navigate = useNavigate();
  const { courseId, assignmentId } = useParams();
  const { role } = useContext(CourseContext);
  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState(0);
  const [dueDate, setDueDate] = useState(0);
  const [description, setDescription] = useState([]);
  const [files, setFiles] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [marksReleased, setMarksReleased] = useState(false);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);

  useEffect(() => {
    getAssignment(assignmentId, navigate)
      .then((data) => {
        setTitle(data.assignmentName);
        setDescription(data.description);
        setTotalMarks(data.totalMarks);
        setMarksReleased(data.marksReleased);
        setReleaseDate(data.releaseDate);
        setDueDate(data.dueDate);
        setFiles(data.files);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [assignmentId, navigate]);

  const handleDeleteAssignment = () => {
    deleteAssignment(assignmentId, navigate)
      .then(() => {
        navigate(`/${courseId}/assignments`);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  return (
    <div className={globalStyles.pageContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.datesContainer}>
          <h6 className={styles.details}>Released: {formatDate(new Date(releaseDate))}</h6>
          <h6 className={styles.details}>Due: {formatDate(new Date(dueDate))}</h6>
        </div>
        <div className={styles.assignmentDetails}>
          <h2 className={styles.assignmentName}>{title}</h2>
          {isTeacher && (
            <EditButtons
              helperText={`assignment ${title}`}
              handleEdit={() => {
                navigate(`/${courseId}/assignments/edit/${assignmentId}`);
              }}
              handleDelete={handleDeleteAssignment}
            />
          )}
        </div>
        <span className={styles.details}>
          <strong>Total Marks:</strong> {totalMarks}
        </span>
      </div>
      <div className={styles.contentContainer}>
        <ColouredBox
          marginSide="0"
          marginTopBottom="1rem"
          paddingTopBottom="0.8rem"
          paddingSide="1.5rem"
          color="light"
          width="100%"
        >
          <RichTextBox content={description} />
        </ColouredBox>
        {(files.length > 0 || !isTeacher) && (
          <div className={styles.downloadSubmitContainer}>
            {files.length > 0 && <DownloadableFileListBox files={files} />}
            {!isTeacher && (
              <SubmissionBox
                marksReleased={marksReleased}
                totalMarks={totalMarks}
                pastDeadline={dueDate < Date.now()}
              />
            )}
          </div>
        )}
      </div>
      {isTeacher && (
        <SubmissionTable
          totalMarks={totalMarks}
          marksReleased={marksReleased}
          setMarksReleased={setMarksReleased}
        />
      )}
    </div>
  );
}
