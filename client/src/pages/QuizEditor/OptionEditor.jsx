import React from 'react';
import { FormControl, FormLabel, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import TextField from '../../components/ControllerWrappedInputs/TextField';
import Checkbox from '../../components/ControllerWrappedInputs/Checkbox';
import styles from './QuizEditor.module.css';

export default function OptionEditor({ questionIdx, optionIdx, option, remove, control }) {
  return (
    <div className={styles.optionBox}>
      <div className={styles.checkboxContainer}>
        <h3 className={styles.optionNum}>{optionIdx + 1}</h3>
        <TextField
          name={`questions.${questionIdx}.options.${optionIdx}.optionText`}
          control={control}
          rules={{ validate: (val) => Boolean(val?.match(/\S/)) }}
          size="small"
          fullWidth
          value={option.optionText}
        />
        <FormControl
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '9.5rem',
          }}
        >
          <FormLabel>Is Answer? </FormLabel>
          <Checkbox
            name={`questions.${questionIdx}.options.${optionIdx}.isAnswer`}
            control={control}
            size="small"
          />
        </FormControl>
        <IconButton onClick={() => remove(optionIdx)}>
          <Delete />
        </IconButton>
      </div>
    </div>
  );
}
