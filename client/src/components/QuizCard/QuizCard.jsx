import React from 'react';
import { Divider, TextField } from '@mui/material';
import ColouredBox from '../ColouredBox/ColouredBox';
import RichTextBox from '../RichTextBox/RichTextBox';
import styles from './QuizCard.module.css';

function QuizCard({
  maximumMark,
  questionNumber,
  questionText,
  children,
  mark,
  displayMarks,
  isMarkingMode,
  handleMarkUpdate,
}) {
  return (
    <ColouredBox color="light" paddingTopBottom="1.5rem" marginTopBottom="1rem" marginSide="0">
      <div className={styles.titleContainer}>
        <h4 className={styles.questionNumber}>{`Question ${questionNumber + 1}`}</h4>
        <span className={styles.marks}>
          <strong>Marks: </strong>
          {isMarkingMode ? (
            <TextField
              label={`/${maximumMark}`}
              size="small"
              sx={{ width: '3rem' }}
              InputProps={{ inputProps: { max: maximumMark, min: 0 } }}
              type="number"
              value={mark}
              onChange={handleMarkUpdate}
            />
          ) : (
            `${displayMarks ? `${mark || 0}/` : ''}${maximumMark}`
          )}
        </span>
      </div>
      <RichTextBox content={questionText} />
      {children ? <Divider sx={{ margin: '0.7rem 0' }} /> : ''}
      {children}
    </ColouredBox>
  );
}

export default QuizCard;
