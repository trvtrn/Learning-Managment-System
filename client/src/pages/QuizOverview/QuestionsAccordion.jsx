import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, useTheme } from '@mui/material';
import { ArrowForwardIosSharp } from '@mui/icons-material';
import QuestionOverviewCard from './QuestionOverviewCard';
import styles from './QuizOverview.module.css';

export default function QuestionsAccordion({
  questions,
  studentResponses,
  isTeacher,
  releaseMarks,
  hasTimeLeft,
  marks,
}) {
  const theme = useTheme();
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{ marginBottom: '1rem', '&:before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ArrowForwardIosSharp fontSize="0.5rem" />}
        sx={{
          padding: 0,
          marginBottom: 0,
          flexDirection: 'row-reverse',
          gap: '0.5rem',
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(90deg)',
          },
          '&:hover': {
            backgroundColor: theme.palette.custom.neutralBackground,
          },
        }}
      >
        <h3 className={styles.subheading}>{isTeacher ? 'Questions' : 'Review'}</h3>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        {questions.map((question) => {
          return (
            <QuestionOverviewCard
              key={question.questionNumber}
              {...question}
              mark={marks.get(question.questionNumber)}
              studentResponse={studentResponses.get(question.questionNumber)}
              displayAnswer={isTeacher || (releaseMarks && !hasTimeLeft)}
              displayMarks={releaseMarks && !hasTimeLeft}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
}
