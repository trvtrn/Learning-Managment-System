import React from 'react';
import MuiSelect from '@mui/material/Select';
import { Controller } from 'react-hook-form';

function Select({ name, control, rules, children, ...rest }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <MuiSelect {...rest} onChange={onChange} value={value}>
          {children}
        </MuiSelect>
      )}
    />
  );
}

export default Select;
