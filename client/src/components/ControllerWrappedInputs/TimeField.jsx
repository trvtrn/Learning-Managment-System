import React from 'react';
import { TimeField as MuiTimeField } from '@mui/x-date-pickers/TimeField';
import { Controller } from 'react-hook-form';

export default function TimeField({ name, control, rules, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <MuiTimeField {...rest} onChange={onChange} value={value} />
      )}
    />
  );
}
