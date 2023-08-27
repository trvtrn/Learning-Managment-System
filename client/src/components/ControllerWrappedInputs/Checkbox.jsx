import React from 'react';
import MuiCheckbox from '@mui/material/Checkbox';
import { Controller } from 'react-hook-form';

export default function Checkbox({ name, control, rules, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <MuiCheckbox {...rest} onChange={onChange} checked={value} />
      )}
    />
  );
}
