import React from 'react';
import { FormControl, FormLabel, TextField } from '@mui/material';

export default function LandingFormInput({ id, label, value, onChange, type, width = '250px' }) {
  return (
    <FormControl>
      <FormLabel
        htmlFor={id}
        sx={{
          fontSize: '0.6rem',
          margin: '5px 0 3px',
        }}
      >
        {label}
      </FormLabel>
      <TextField
        sx={{ width }}
        name={id}
        id={id}
        autoComplete="on"
        value={value}
        onChange={onChange}
        type={type}
        variant="outlined"
        size="small"
      />
    </FormControl>
  );
}
