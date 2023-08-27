import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import QuizOverviewCard from './QuizOverviewCard';
import BottomRightAddButton from '../../components/BottomRightAddButton';
import { deleteQuiz, getQuizzes } from '../../utils/api/quizzes';
import { CourseContext } from '../../utils/contexts';

import globalStyles from '../../index.module.css';
import styles from './QuizzesOverview.module.css';

export default function QuizzesOverview() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const [quizzes, setQuizzes] = useState([]);

  const publishedQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.releaseDate <= Date.now()),
    [quizzes]
  );

  const unpublishedQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.releaseDate > Date.now()),
    [quizzes]
  );

  const updatePageDetails = useCallback(() => {
    getQuizzes(courseId, navigate)
      .then((data) => {
        setQuizzes(data);
      })
      .catch((err) => console.error(err.message));
  }, [courseId, navigate]);

  useEffect(() => {
    updatePageDetails();
  }, [updatePageDetails]);

  const handleAdd = () => {
    navigate(`/${courseId}/quiz/edit`);
  };

  const handleDelete = (quizId) => {
    deleteQuiz(quizId, navigate)
      .then(updatePageDetails)
      .catch((err) => console.error(err.message));
  };

  return (
    <div className={globalStyles.pageContainer}>
      <h2 className={globalStyles.pageHeading}>Quizzes</h2>
      {isTeacher && publishedQuizzes.length !== 0 && (
        <h3 className={styles.published}>Published</h3>
      )}
      {publishedQuizzes.map((quiz) => (
        <QuizOverviewCard key={quiz.quizId} handleDelete={handleDelete} isPublished {...quiz} />
      ))}
      {isTeacher && unpublishedQuizzes.length !== 0 && (
        <h2 className={styles.published}>Unpublished</h2>
      )}
      {isTeacher &&
        unpublishedQuizzes.map((quiz) => (
          <QuizOverviewCard key={quiz.quizId} handleDelete={handleDelete} {...quiz} />
        ))}
      {isTeacher && <BottomRightAddButton tooltipLabel="Create New Quiz" handleAdd={handleAdd} />}
    </div>
  );
}
