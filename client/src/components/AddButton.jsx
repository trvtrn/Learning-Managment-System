import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

export default function AddButton({ handleAdd, tooltipLabel, tooltipPlacement, ...rest }) {
  const theme = useTheme();
  return (
    <Tooltip title={tooltipLabel} placement={tooltipPlacement}>
      <IconButton
        onClick={handleAdd}
        sx={{
          color: theme.palette.custom.defaultFont,
          backgroundColor: theme.palette.normal.main,
          ':hover': {
            color: theme.palette.custom.background,
            backgroundColor: theme.palette.normal.active,
          },
          ...rest?.sx,
        }}
      >
        <AddOutlined sx={{ fontSize: '2.5rem' }} />
      </IconButton>
    </Tooltip>
  );
}
