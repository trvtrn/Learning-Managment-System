import React from 'react';
import { IconButton, Divider } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { useWatch } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import ColouredBox from '../../components/ColouredBox/ColouredBox';
import QuestionTypeSelector from './QuestionTypeSelector';
import OptionsEditor from './OptionsEditor';
import RichTextEditor from '../../components/ControllerWrappedInputs/RichTextEditor';
import TextField from '../../components/ControllerWrappedInputs/TextField';
import { isBlank } from '../../utils/helpers';

import styles from './QuizEditor.module.css';

export default function QuestionEditingCard({
  questionIdx,
  options,
  remove,
  control,
  getNextKey,
  dragHandleProps,
  setValue,
  defaultValue,
}) {
  const { questionType } = useWatch({
    name: `questions.${questionIdx}`,
    control,
  });
  return (
    <ColouredBox
      color="info"
      marginSide={0}
      paddingTopBottom="1.5rem"
      paddingSide="1.5rem"
      marginTopBottom="1.5rem"
    >
      <div className={styles.headingContentContainer}>
        <h3 className={styles.questionNumber}>
          <span className={styles.dragHandle} {...dragHandleProps}>
            <DragIndicator />
          </span>
          {`Question ${questionIdx + 1}`}
        </h3>
        <IconButton onClick={() => remove(questionIdx)}>
          <DeleteIcon />
        </IconButton>
      </div>
      <div className={styles.questionInfoContainer}>
        <RichTextEditor
          isSticky={false}
          name={`questions.${questionIdx}.questionText`}
          rules={{ validate: (val) => !isBlank(val) }}
          control={control}
          setValue={setValue}
          defaultValue={defaultValue}
        />
        {questionType === 'Short Answer' && (
          <TextField
            name={`questions.${questionIdx}.maximumMark`}
            control={control}
            type="number"
            InputProps={{ inputProps: { min: 1 } }}
            size="small"
            label="Marks"
            sx={{ width: '6rem' }}
          />
        )}
        <QuestionTypeSelector questionIdx={questionIdx} control={control} />
      </div>
      {questionType === 'Multiple Choice' && (
        <>
          <Divider sx={{ marginTop: '1rem', marginBottom: '1rem' }} />
          <OptionsEditor
            questionIdx={questionIdx}
            options={options}
            control={control}
            getNextKey={getNextKey}
          />
        </>
      )}
    </ColouredBox>
  );
}
