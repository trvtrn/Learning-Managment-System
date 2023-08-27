import React, { useContext, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';

import ColouredBox from '../../components/ColouredBox/ColouredBox';
import EditButtons from '../../components/EditButtons';
import QuizEditWarningModal from '../../components/QuizEditWarningModal';
import { formatDate } from '../../utils/helpers';
import { CourseContext } from '../../utils/contexts';

import styles from './QuizzesOverview.module.css';

export default function QuizOverviewCard({
  quizId,
  name,
  releaseDate,
  dueDate,
  duration,
  totalMarks,
  questionCount,
  weighting,
  handleDelete,
  isPublished,
}) {
  const theme = useTheme();
  const { courseId } = useParams();
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const goToEditPage = () => {
    navigate(`/${courseId}/quiz/edit/${quizId}`);
  };
  return (
    <Link
      to={`/${courseId}/quiz/${quizId}`}
      style={{
        display: 'block',
        width: '100%',
        textDecoration: 'none',
        color: theme.palette.custom.defaultFont,
      }}
    >
      <ColouredBox
        color={isPublished ? 'info' : 'light'}
        height="fit"
        marginTopBottom="1rem"
        marginSide="auto"
        paddingTopBottom="1.5rem"
      >
        <div className={styles.textContainer}>
          <section className={styles.leftSide}>
            <h1 className={styles.quizTitle}>{name}</h1>
            <div className={styles.quizTime}>
              <h4 className={styles.h4}>{`Open: ${formatDate(new Date(releaseDate))}`}</h4>
              <h4 className={styles.h4}>{`Close: ${formatDate(new Date(dueDate))}`}</h4>
            </div>
          </section>
          <section className={styles.rightSide}>
            <div className={styles.quizInfo}>
              <h4 className={styles.h4}>{`Time Limit: ${duration} minute${
                duration === 1 ? '' : 's'
              }`}</h4>
              <h4 className={styles.h4}>{`Question Count: ${questionCount}`}</h4>
              <h4 className={styles.h4}>{`Total Marks: ${totalMarks || 0}`}</h4>
              <h4 className={styles.h4}>{`Weighting: ${weighting}%`}</h4>
            </div>
            {isTeacher && (
              <EditButtons
                fontSize="small"
                helperText={`quiz ${name}`}
                handleEdit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isPublished) {
                    setShowModal(true);
                  } else {
                    navigate(`/${courseId}/quiz/edit/${quizId}`);
                  }
                }}
                handleDelete={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(quizId);
                }}
              />
            )}
          </section>
        </div>
      </ColouredBox>
      {showModal && (
        <QuizEditWarningModal
          name={name}
          setShowModal={setShowModal}
          onConfirm={() => goToEditPage()}
        />
      )}
    </Link>
  );
}
