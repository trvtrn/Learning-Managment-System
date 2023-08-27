import React from 'react';
import AddButton from './AddButton';

export default function BottomRightAddButton({ handleAdd, ...rest }) {
  return (
    <AddButton
      tooltipPlacement="top"
      sx={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}
      handleAdd={handleAdd}
      {...rest}
    />
  );
}
