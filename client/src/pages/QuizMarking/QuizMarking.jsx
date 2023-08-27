import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@mui/material';
import styles from './QuizMarking.module.css';
import globalStyles from '../../index.module.css';
import QuestionMarkingCard from './QuestionMarkingCard';
import { getMarks, getQuiz, getSubmission, updateMarks } from '../../utils/api/quizzes';
import { getUserById } from '../../utils/api/auth';

export default function QuizMarking() {
  const [questions, setQuestions] = useState([]);
  const [studentResponses, setStudentAnswers] = useState(new Map());
  const [submitterName, setSubmitterName] = useState();
  const [marks, setMarks] = useState(new Map());
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const { quizId, userId, courseId } = useParams();

  useEffect(() => {
    getSubmission(quizId, userId, navigate)
      .then((data) => {
        const newAnswerMap = new Map();
        for (const { questionNumber, optionNumber, answerText } of data.answers) {
          newAnswerMap.set(questionNumber, answerText || optionNumber);
        }
        setStudentAnswers(newAnswerMap);
      })
      .then(() => getUserById(userId))
      .then((data) => setSubmitterName(`${data.firstName} ${data.lastName}`))
      .catch((err) => console.error(err.message));
    getMarks(quizId, userId, navigate)
      .then((data) => {
        const newMarkMap = new Map();
        for (const { questionNumber, mark } of data) {
          newMarkMap.set(questionNumber, mark);
        }
        setMarks(newMarkMap);
      })
      .catch((err) => console.error(err.message));
    getQuiz(quizId, navigate)
      .then((data) => {
        setTitle(data.name);
        setQuestions(data.questions);
      })
      .catch((err) => console.error(err.message));
  }, [navigate, quizId, userId]);

  const handleSave = () => {
    const questionMarks = [];
    marks.forEach((mark, questionNumber) => {
      questionMarks.push({
        questionNumber,
        mark,
      });
    });
    updateMarks(quizId, userId, questionMarks, navigate)
      .then((data) => {
        navigate(`/${courseId}/quiz/${quizId}`);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const handleMarkUpdate = (questionNumber, newMark) => {
    const newMarks = new Map(marks);
    newMarks.set(questionNumber, parseInt(newMark, 10));
    setMarks(newMarks);
  };

  return (
    <div className={globalStyles.pageContainer}>
      <span className={styles.submitter}>Submission by {submitterName}</span>
      <h2 className={globalStyles.pageHeading}>{title}</h2>
      {questions.map((question) => (
        <QuestionMarkingCard
          key={question.questionNumber}
          {...question}
          mark={marks.get(question.questionNumber) || 0}
          studentResponse={studentResponses.get(question.questionNumber)}
          handleMarkUpdate={handleMarkUpdate}
        />
      ))}
      <div className={styles.saveButtonContainer}>
        <Button variant="contained" onClick={handleSave}>
          Save Marks
        </Button>
      </div>
    </div>
  );
}
