import React from 'react';
import QuizCard from '../../components/QuizCard/QuizCard';
import Options from '../../components/QuizCard/Options';
import { calculateSingleMCMark } from '../../utils/helpers';
import RichTextBox from '../../components/RichTextBox/RichTextBox';

export default function QuestionMarkingCard({
  questionText,
  questionNumber,
  questionType,
  maximumMark,
  studentResponse,
  handleMarkUpdate,
  mark,
  options,
}) {
  return (
    <QuizCard
      questionNumber={questionNumber}
      questionText={questionText}
      maximumMark={maximumMark}
      questionType={questionType}
      handleMarkUpdate={(e) => handleMarkUpdate(questionNumber, e.target.value)}
      mark={
        questionType === 'Multiple Choice' ? calculateSingleMCMark(studentResponse, options) : mark
      }
      isMarkingMode={questionType !== 'Multiple Choice'}
      displayMarks
    >
      {questionType === 'Multiple Choice' ? (
        <Options options={options} studentResponse={studentResponse} disableEditing displayAnswer />
      ) : (
        studentResponse && <RichTextBox content={studentResponse} />
      )}
    </QuizCard>
  );
}
