import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@mui/material';

import {
  createSubmission,
  getOwnSubmission,
  getQuiz,
  updateOwnSubmission,
} from '../../utils/api/quizzes';
import QuestionTakingCard from './QuestionTakingCard';
import Timer from './Timer';

import globalStyles from '../../index.module.css';
import styles from './Quiz.module.css';
import { isBlank } from '../../utils/helpers';

export default function Quiz() {
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [studentResponses, setStudentResponses] = useState(new Map());
  const [startTime, setStartTime] = useState(0);
  const [dueDate, setDueDate] = useState(0);
  const [duration, setDuration] = useState(0);
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();
  const timeLeft = Math.floor(
    Math.max(Math.min(startTime + duration * 60 * 1000 - Date.now(), dueDate - Date.now()), 0) /
      1000
  );

  useEffect(() => {
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
        setStudentResponses(newStudentResponses);
      })
      .catch((err) => {
        console.error(err.message);
        // No submission found. Create submission.
        return createSubmission(quizId, navigate).then(({ startTime: newStartTime }) =>
          setStartTime(newStartTime)
        );
      })
      .then(() => {
        // After creating/getting a submission, the student has full access
        // to quiz content
        getQuiz(quizId, navigate).then((data) => {
          setName(data.name);
          setDueDate(data.dueDate);
          setDuration(data.duration);
          data.questions.sort((a, b) => a.questionNumber - b.questionNumber);
          setQuestions(data.questions);
        });
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [quizId, navigate]);

  const handleStudentResponseChange = (questionNumber, studentResponse) => {
    setStudentResponses((prev) => {
      const newStudentResponses = new Map(prev);
      newStudentResponses.set(questionNumber, studentResponse);
      return newStudentResponses;
    });
  };

  const handleSubmit = () => {
    const answerArr = [];
    for (const questionNumber of studentResponses.keys()) {
      if (typeof studentResponses.get(questionNumber) === 'number') {
        if (studentResponses.get(questionNumber) !== -1) {
          answerArr.push({
            questionNumber,
            optionNumber: studentResponses.get(questionNumber),
          });
        }
      } else if (
        studentResponses.get(questionNumber) !== null &&
        !isBlank(studentResponses.get(questionNumber))
      ) {
        answerArr.push({
          questionNumber,
          answerText: studentResponses.get(questionNumber),
        });
      }
    }
    updateOwnSubmission(quizId, answerArr, navigate)
      .then((data) => {
        navigate(`/${courseId}/quiz/${quizId}`);
      })
      .catch((err) => {
        console.error(err.message);
      });
  };

  const handleTimeExpired = () => {
    handleSubmit();
  };

  return (
    <div className={globalStyles.pageContainer}>
      <h2 className={globalStyles.pageHeading}>{name}</h2>
      {startTime > 0 && <Timer timeInSeconds={timeLeft} onTimeExpired={handleTimeExpired} />}
      {questions.map((question, idx) => (
        <QuestionTakingCard
          key={question.questionNumber}
          {...question}
          studentResponse={studentResponses.get(question.questionNumber)}
          handleStudentResponseChange={handleStudentResponseChange}
        />
      ))}
      <div className={styles.buttonContainer}>
        <Button variant="contained" onClick={handleSubmit}>
          Save and Quit
        </Button>
      </div>
    </div>
  );
}
