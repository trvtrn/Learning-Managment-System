import React from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller } from 'react-hook-form';

export default function DatePicker({ name, control, rules, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <MuiDatePicker {...rest} value={value} onChange={onChange} />
      )}
    />
  );
}
