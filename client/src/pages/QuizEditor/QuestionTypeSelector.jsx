import React from 'react';
import { FormControl, InputLabel, MenuItem } from '@mui/material';
import Select from '../../components/ControllerWrappedInputs/Select';

export default function QuestionTypeSelector({ questionIdx, control }) {
  return (
    <FormControl sx={{ width: '15rem' }}>
      <InputLabel>Question Type</InputLabel>
      <Select
        name={`questions.${questionIdx}.questionType`}
        control={control}
        rules={{ required: true }}
        label="Question Type"
        size="small"
      >
        <MenuItem value="Multiple Choice">Multiple Choice</MenuItem>
        <MenuItem value="Short Answer">Short Answer</MenuItem>
      </Select>
    </FormControl>
  );
}
