import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Divider, FormControlLabel, Switch } from '@mui/material';

import ColouredBox from '../../components/ColouredBox/ColouredBox';
import SubmissionTable from './SubmissionTable';
import RichTextBox from '../../components/RichTextBox/RichTextBox';
import EditButtons from '../../components/EditButtons';
import QuestionsAccordion from './QuestionsAccordion';
import QuizInfo from './QuizInfo';
import QuizEditWarningModal from '../../components/QuizEditWarningModal';

import { formatDate, calculateMCMark } from '../../utils/helpers';
import {
  getQuiz,
  updateReleaseMarks,
  getOwnSubmission,
  getAllSubmissions,
  deleteQuiz,
  getOwnMarks,
} from '../../utils/api/quizzes';
import { CourseContext } from '../../utils/contexts';

import globalStyles from '../../index.module.css';
import styles from './QuizOverview.module.css';

export default function QuizOverview() {
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();

  // Quiz details
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(0);
  const [releaseDate, setReleaseDate] = useState(0);
  const [dueDate, setDueDate] = useState(0);
  const [description, setDescription] = useState('');
  const [releaseMarks, setReleaseMarks] = useState(false);
  const [weighting, setWeighting] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const totalMarks = useMemo(
    () => questions.reduce((acc, next) => acc + next.maximumMark, 0),
    [questions]
  );

  // User info
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Educator' || role === 'Creator', [role]);

  // Student specific information
  const [startTime, setStartTime] = useState();
  const [studentResponses, setAnswers] = useState(new Map());
  const [hasTimeLeft, setHasTimeLeft] = useState(true);
  const [marks, setMarks] = useState(new Map());
  const [grade, setGrade] = useState(0);

  // Warn when editing a published quiz
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getQuiz(quizId, navigate)
      .then((data) => {
        setName(data.name);
        setDuration(data.duration);
        setWeighting(data.weighting);
        setReleaseDate(new Date(data.releaseDate));
        setReleaseMarks(data.releaseMarks);
        setDueDate(new Date(data.dueDate));
        setDescription(data.description);
        data.questions.sort((a, b) => a.questionNumber - b.questionNumber);
        setQuestions(data.questions);
      })
      .catch((err) => console.error(err.message));
  }, [quizId, navigate]);

  // Get submission if student
  useEffect(() => {
    if (role !== 'Student') return;
    getOwnSubmission(quizId, navigate)
      .then((data) => {
        setStartTime(data.startTime);
        const newStudentResponses = new Map();
        for (const studentResponse of data.answers) {
          newStudentResponses.set(
            studentResponse.questionNumber,
            studentResponse.answerText || studentResponse.optionNumber
          );
        }
        setAnswers(newStudentResponses);
      })
      .catch((err) => console.error(err.message));
  }, [role, quizId, navigate]);

  // Check if student has time left
  useEffect(() => {
    if (startTime === undefined) {
      return () => {};
    }

    setHasTimeLeft(Math.min(startTime + duration * 60 * 1000, dueDate) - Date.now() - 1000 > 0);

    const interval = setInterval(() => {
      setHasTimeLeft(Math.min(startTime + duration * 60 * 1000, dueDate) - Date.now() - 1000 > 0);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startTime, duration, dueDate]);

  // Set grade if student and marks are visible
  useEffect(() => {
    if (role !== 'Student' || !releaseMarks) return;
    getOwnMarks(quizId, navigate)
      .then((data) => {
        setGrade(
          data.reduce((acc, next) => acc + next.mark, 0) +
            calculateMCMark(studentResponses, questions)
        );
        const newMarks = new Map();
        for (const questionMark of data) {
          newMarks.set(questionMark.questionNumber, questionMark.mark);
        }
        setMarks(newMarks);
      })
      .catch((err) => console.error(err.message));
  }, [role, releaseMarks, quizId, studentResponses, questions, navigate]);

  // Get all student submissions if teacher
  useEffect(() => {
    if (!isTeacher) return;
    getAllSubmissions(quizId, navigate)
      .then(setSubmissions)
      .catch((err) => console.error(err.message));
  }, [isTeacher, quizId, navigate]);

  const toggleReleaseMarks = () => {
    updateReleaseMarks(quizId, !releaseMarks, navigate);
    setReleaseMarks(!releaseMarks);
  };

  const handleStart = () => {
    navigate(`/${courseId}/quiz/${quizId}/attempt`);
  };

  const handleDelete = () => {
    deleteQuiz(quizId, navigate)
      .then(() => navigate(`/${courseId}/quiz`))
      .catch((err) => console.error(err.message));
  };

  const handleEdit = () => {
    if (releaseDate <= Date.now()) {
      setShowModal(true);
    } else {
      goToEditPage();
    }
  };

  const goToEditPage = () => {
    navigate(`/${courseId}/quiz/edit/${quizId}`);
  };

  const startButtonText = useMemo(() => {
    if (dueDate < Date.now()) {
      return 'Submission Closed';
    }
    if (startTime === undefined) {
      return 'Start';
    }
    if (hasTimeLeft) {
      return 'Continue';
    }
    return 'Submission Closed';
  }, [hasTimeLeft, startTime, dueDate]);

  return (
    <div className={globalStyles.pageContainer}>
      <div className={styles.titleContainer}>
        <span className={styles.times}>Released: {formatDate(new Date(releaseDate))}</span>
        <span className={styles.times}>Due: {formatDate(new Date(dueDate))}</span>
      </div>
      <div className={styles.titleContainer}>
        <h2 className={styles.pageHeading}>{name}</h2>
        {isTeacher && (
          <EditButtons
            helperText={`quiz ${name}`}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        )}
      </div>
      <ColouredBox
        color="light"
        paddingTopBottom="1.5rem"
        paddingSide="1.5rem"
        marginSide="0"
        marginTopBottom="1rem"
      >
        <QuizInfo
          duration={duration}
          totalMarks={totalMarks}
          weighting={weighting}
          questionCount={questions.length}
          grade={grade}
          isTeacher={isTeacher}
          showGrade={!hasTimeLeft && releaseMarks}
        />
        <Divider sx={{ margin: '1rem 0' }} />
        <RichTextBox content={description} />
      </ColouredBox>
      {isTeacher && (
        <>
          <div className={styles.toggleContainer}>
            <h3 className={styles.subheading}>Submissions</h3>
            <FormControlLabel
              value="Release Marks"
              control={
                <Switch color="primary" checked={releaseMarks} onChange={toggleReleaseMarks} />
              }
              label="Release Marks"
              labelPlacement="start"
            />
          </div>
          <SubmissionTable submissions={submissions} totalMarks={totalMarks} />
        </>
      )}
      {(isTeacher || startTime) && (
        <QuestionsAccordion
          questions={questions}
          studentResponses={studentResponses}
          marks={marks}
          isTeacher={isTeacher}
          releaseMarks={releaseMarks}
          hasTimeLeft={hasTimeLeft}
        />
      )}
      {isTeacher || (
        <div className={styles.buttonContainer}>
          <Button
            variant="contained"
            onClick={handleStart}
            disabled={!hasTimeLeft || dueDate < Date.now()}
          >
            {startButtonText}
          </Button>
        </div>
      )}
      {showModal && (
        <QuizEditWarningModal name={name} setShowModal={setShowModal} onConfirm={goToEditPage} />
      )}
    </div>
  );
}
