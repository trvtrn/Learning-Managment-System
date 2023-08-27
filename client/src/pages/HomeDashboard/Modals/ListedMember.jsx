import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, TableCell, TableRow } from '@mui/material';

export default function ListedMember({ email, role, remove }) {
  return (
    <TableRow>
      <TableCell>{email}</TableCell>
      <TableCell style={{ width: '20%' }}>{role} </TableCell>
      <TableCell style={{ width: '10%' }}>
        <IconButton
          size="small"
          onClick={() => {
            remove(email);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
