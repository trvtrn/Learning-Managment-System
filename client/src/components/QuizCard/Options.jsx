import React from 'react';
import { Radio, useTheme } from '@mui/material';

import styles from './QuizCard.module.css';

function Options({
  options,
  studentResponse,
  handleStudentResponseChange,
  disableEditing,
  displayAnswer,
}) {
  const theme = useTheme();
  return (
    <>
      {options.map((option) => {
        let backgroundColor;
        if (!displayAnswer) {
          backgroundColor = theme.palette.custom.background;
        } else if (option.isAnswer) {
          backgroundColor = theme.palette.custom.green;
        } else if (option.optionNumber === studentResponse) {
          backgroundColor = theme.palette.custom.red;
        } else {
          backgroundColor = theme.palette.custom.background;
        }
        return (
          <div
            key={option.optionNumber}
            className={styles.optionAnswerBox}
            style={{ backgroundColor, borderRadius: '5px' }}
          >
            <Radio
              value={option.optionNumber}
              size="small"
              checked={studentResponse === option.optionNumber}
              disabled={disableEditing}
              onClick={handleStudentResponseChange}
            />
            <span>{option.optionText}</span>
          </div>
        );
      })}
    </>
  );
}

export default Options;
