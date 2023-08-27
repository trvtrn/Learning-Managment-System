import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import TitleInput from '../../components/TitleInput';
import AssignmentDetails from './AssignmentDetails';
import RichTextInput from '../../components/RichTextInput';
import AttachFilesInput from '../../components/AttachFilesInput/AttachFilesInput';
import FormFooter from '../../components/FormFooter/FormFooter';
import { getAllFiles } from '../../utils/api/file';
import { createDateTime, isValidDateTimeInput } from '../../utils/helpers';
import { getAssignment, createOrUpdateAssignment } from '../../utils/api/assignments';

import globalStyles from '../../index.module.css';

export default function AssignmentEditor() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState(null);
  const [releaseTime, setReleaseTime] = useState(null);
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState(null);
  const [totalMarks, setTotalMarks] = useState(0);
  const [weighting, setWeighting] = useState(0);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!assignmentId) {
      return;
    }

    getAssignment(assignmentId, navigate)
      .then((data) => {
        setTitle(data.assignmentName);
        setDescription(data.description);
        setTotalMarks(data.totalMarks);
        setReleaseDate(dayjs(data.releaseDate));
        setReleaseTime(dayjs(data.releaseDate));
        setDeadlineDate(dayjs(data.dueDate));
        setDeadlineTime(dayjs(data.dueDate));
        setWeighting(data.weighting);

        return data.files;
      })
      .then((existingFiles) => getAllFiles(existingFiles, navigate))
      .then((fileObjs) => setFiles(fileObjs))
      .catch((err) => {
        console.error(err.message);
      });
  }, [assignmentId, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const release = createDateTime(new Date(releaseDate), new Date(releaseTime)).getTime();
    const deadline = createDateTime(new Date(deadlineDate), new Date(deadlineTime)).getTime();

    if (
      title.match(/^\s*$/) ||
      description
        .replace(/<(.|\n)*?>/g, '')
        .trim()
        .match(/^\s*$/) ||
      !isValidDateTimeInput(releaseDate) ||
      !isValidDateTimeInput(releaseTime) ||
      !isValidDateTimeInput(deadlineDate) ||
      !isValidDateTimeInput(deadlineTime) ||
      totalMarks === '' ||
      weighting === ''
    ) {
      setErrorMessage('Do not leave fields blank');
    } else if (release >= deadline) {
      setErrorMessage('Deadline must be after release date');
    } else if (deadline <= Date.now()) {
      setErrorMessage('Deadline cannot be in the past');
    } else {
      setErrorMessage('');
      createOrUpdateAssignment(
        assignmentId,
        courseId,
        title,
        release,
        deadline,
        totalMarks,
        weighting,
        description,
        files,
        navigate
      )
        .then(({ assignmentId: newAssignmentId }) => {
          navigate(`/${courseId}/assignments/${assignmentId || newAssignmentId}`);
        })
        .catch((err) => setErrorMessage(err.message));
    }
  };

  const handleCancel = () => {
    if (!assignmentId) {
      navigate(`/${courseId}/assignments`);
    } else {
      navigate(`/${courseId}/assignments/${assignmentId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={globalStyles.pageContainer}>
      <TitleInput
        label="Assignment Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <AssignmentDetails
        releaseDate={releaseDate}
        setReleaseDate={setReleaseDate}
        releaseTime={releaseTime}
        setReleaseTime={setReleaseTime}
        deadlineDate={deadlineDate}
        setDeadlineDate={setDeadlineDate}
        deadlineTime={deadlineTime}
        setDeadlineTime={setDeadlineTime}
        totalMarks={totalMarks}
        setTotalMarks={setTotalMarks}
        weighting={weighting}
        setWeighting={setWeighting}
      />
      <RichTextInput value={description} onChange={setDescription} />
      <AttachFilesInput files={files} setFiles={setFiles} />
      <FormFooter errorMessage={errorMessage} onCancel={handleCancel} />
    </form>
  );
}
