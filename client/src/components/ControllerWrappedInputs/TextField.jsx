import React from 'react';
import MuiTextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';

export default function TextField({ name, control, rules, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <MuiTextField {...rest} onChange={onChange} value={value === undefined ? '' : value} />
      )}
    />
  );
}
