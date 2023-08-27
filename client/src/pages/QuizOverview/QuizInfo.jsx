import React from 'react';
import {
  TimerOutlined,
  ScaleOutlined,
  GradingOutlined,
  ChecklistOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import styles from './QuizOverview.module.css';

export default function QuizInfo({
  duration,
  weighting,
  questionCount,
  totalMarks,
  isTeacher,
  grade,
  showGrade,
}) {
  const theme = useTheme();
  return (
    <div className={styles.quizInfo}>
      <span className={styles.quizInfoSection}>
        <TimerOutlined fontSize="large" sx={{ fill: theme.palette.custom.outline }} />
        {duration} minute{duration !== 1 && 's'}
        <b>Time Limit</b>
      </span>
      <span className={styles.quizInfoSection}>
        <ScaleOutlined fontSize="large" sx={{ fill: theme.palette.custom.outline }} />
        {weighting}%<b>Weighting</b>
      </span>
      <span className={styles.quizInfoSection}>
        <ChecklistOutlined fontSize="large" sx={{ fill: theme.palette.custom.outline }} />
        {questionCount}
        <b>Total Questions</b>
      </span>
      <span className={styles.quizInfoSection}>
        <GradingOutlined fontSize="large" sx={{ fill: theme.palette.custom.outline }} />
        {isTeacher || !showGrade ? (
          <>
            {totalMarks}
            <b>Total marks</b>
          </>
        ) : (
          <>
            {grade || 0}/{totalMarks}
            <b>Grade</b>
          </>
        )}
      </span>
    </div>
  );
}
