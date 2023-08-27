import React from 'react';
import QuizCard from '../../components/QuizCard/QuizCard';
import Options from '../../components/QuizCard/Options';
import { calculateSingleMCMark } from '../../utils/helpers';
import RichTextBox from '../../components/RichTextBox/RichTextBox';

export default function QuestionOverviewCard({
  id,
  questionNumber,
  questionText,
  questionType,
  options,
  mark,
  maximumMark,
  studentResponse,
  displayAnswer,
  displayMarks,
}) {
  return (
    <QuizCard
      maximumMark={maximumMark}
      questionNumber={questionNumber}
      questionText={questionText}
      mark={
        questionType === 'Multiple Choice' ? calculateSingleMCMark(studentResponse, options) : mark
      }
      displayMarks={displayMarks}
    >
      {questionType === 'Multiple Choice' && options.length > 0 ? (
        <Options
          options={options}
          disableEditing
          displayAnswer={displayAnswer}
          studentResponse={studentResponse}
        />
      ) : (
        studentResponse && <RichTextBox content={studentResponse} />
      )}
    </QuizCard>
  );
}
