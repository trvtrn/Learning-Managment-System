import React from 'react';
import { TextField } from '@mui/material';
import EditorFormInputBase from './EditorFormInputBase';

export default function TitleInput({ label = 'Title', id = 'title', value, onChange }) {
  return (
    <EditorFormInputBase label={label} htmlFor={id}>
      <TextField
        fullWidth
        id="title"
        name="title"
        value={value}
        onChange={onChange}
        type="text"
        variant="outlined"
        size="large"
      />
    </EditorFormInputBase>
  );
}
