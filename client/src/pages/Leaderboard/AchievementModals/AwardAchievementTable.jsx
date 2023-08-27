import React from 'react';
import { Checkbox, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

function AwardAchievementTable({ membersNotAwarded, awardees, setAwardees }) {
  return (
    <Table>
      <TableHead>
        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Name</TableCell>
        <TableCell sx={{ fontWeight: 'bold', width: '55%' }}>Email</TableCell>
        <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>
          Award
        </TableCell>
      </TableHead>
      <TableBody>
        {membersNotAwarded.length > 0 ? (
          membersNotAwarded.map(({ firstName, lastName, email }) => (
            <TableRow>
              <TableCell>
                {firstName} {lastName}
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-all' }}>{email}</TableCell>
              <TableCell align="center">
                <Checkbox
                  onChange={() =>
                    setAwardees((prev) => {
                      const newAwardees = new Set(prev);
                      if (prev.has(email)) {
                        newAwardees.delete(email);
                      } else {
                        newAwardees.add(email);
                      }
                      return newAwardees;
                    })
                  }
                  checked={awardees.has(email)}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell align="center" colSpan={3} sx={{ borderBottom: 'none' }}>
              All members have received this award!
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default AwardAchievementTable;
