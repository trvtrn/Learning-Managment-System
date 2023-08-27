import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { IconButton } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import OptionEditor from './OptionEditor';
import styles from './QuizEditor.module.css';

export default function OptionsEditor({ questionIdx, control, getNextKey }) {
  const { fields, remove, append } = useFieldArray({
    name: `questions.${questionIdx}.options`,
    control,
  });
  return (
    <div className={styles.multipleOptions}>
      {fields.map((option, optionIdx) => (
        <OptionEditor
          key={option.key}
          questionIdx={questionIdx}
          optionIdx={optionIdx}
          option={option}
          control={control}
          remove={remove}
        />
      ))}
      <IconButton
        sx={{ display: 'block', margin: '0 auto', lineHeight: '1rem' }}
        onClick={() => {
          append({ key: getNextKey(), optionText: '', isAnswer: false });
        }}
      >
        <AddOutlined />
      </IconButton>
    </div>
  );
}
