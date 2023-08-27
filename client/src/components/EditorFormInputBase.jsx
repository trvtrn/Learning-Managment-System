import React from 'react';
import { FormControl, FormLabel, useTheme } from '@mui/material';

export default function EditorFormInputBase({
  label,
  htmlFor,
  children,
  small,
  inline,
  width = '100%',
}) {
  const theme = useTheme();
  const formControlStyles = inline
    ? {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
      }
    : {};
  return (
    <FormControl
      sx={{
        marginBottom: '1rem',
        gap: inline ? '0.5rem' : '0',
        width: { width },
        ...formControlStyles,
      }}
    >
      <FormLabel
        sx={{
          width: 'fit-content',
          color: theme.palette.custom.defaultFont,
          fontWeight: 'bold',
          marginBottom: inline ? '0' : '0.7rem',
          fontSize: small ? '0.85rem' : '1.25rem',
        }}
        htmlFor={htmlFor}
      >
        {label}
      </FormLabel>
      {children}
    </FormControl>
  );
}
