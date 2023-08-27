import React from 'react';
import { useTheme, MenuItem, Select } from '@mui/material';
import styles from './CategoryEditor.module.css';

const colors = ['blue', 'green', 'pink', 'purple', 'yellow'];

function ColorSelect({ color, ...rest }) {
  const theme = useTheme();
  return (
    <Select
      {...rest}
      id="color"
      value={color}
      inputProps={{
        sx: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.palette.background,
          ...rest?.inputProps?.sx,
        },
      }}
    >
      {colors.map((colorStr, idx) => (
        <MenuItem
          key={idx}
          sx={{
            display: 'flex',
            padding: '0.4rem 1rem',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          value={colorStr}
        >
          <div
            className={styles.colorCircle}
            style={{ backgroundColor: theme.palette.custom[colorStr] }}
          />
        </MenuItem>
      ))}
    </Select>
  );
}

export default ColorSelect;
