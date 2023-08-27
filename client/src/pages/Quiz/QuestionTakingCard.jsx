import React from 'react';

import QuizCard from '../../components/QuizCard/QuizCard';

import Options from '../../components/QuizCard/Options';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';

export default function QuestionTakingCard({
  questionNumber,
  questionText,
  questionType,
  options,
  maximumMark,
  studentResponse,
  handleStudentResponseChange,
}) {
  const handleShortAnswerChange = (val) => {
    handleStudentResponseChange(questionNumber, val);
  };
  const handleMultipleChoiceChange = (e) => {
    handleStudentResponseChange(
      questionNumber,
      parseInt(e.target.value, 10) === studentResponse ? -1 : parseInt(e.target.value, 10)
    );
  };

  return (
    <QuizCard questionNumber={questionNumber} questionText={questionText} maximumMark={maximumMark}>
      {questionType === 'Short Answer' && (
        <RichTextEditor
          isSticky={false}
          minContainerHeight="1rem"
          value={studentResponse}
          onChange={handleShortAnswerChange}
        />
      )}
      {questionType === 'Multiple Choice' && (
        <Options
          options={options}
          handleStudentResponseChange={handleMultipleChoiceChange}
          studentResponse={studentResponse}
        />
      )}
    </QuizCard>
  );
}
