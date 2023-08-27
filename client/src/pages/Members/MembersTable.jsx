import React from 'react';

import { Table, TableBody, TableCell, TableContainer, TableRow, TableHead } from '@mui/material';

import MemberDetails from './MemberDetails';
import ColouredBox from '../../components/ColouredBox/ColouredBox';

import styles from './Members.module.css';

export default function MembersTable({ changeRole, users, removeMember }) {
  return (
    <ColouredBox color="light" marginSide="0" marginTopBottom="0" paddingTopBottom="1rem">
      <TableContainer>
        <Table sx={{ minWidth: '650px' }}>
          <TableHead>
            <TableRow>
              <TableCell className={styles.headingCell} sx={{ width: '35%', fontWeight: 'bold' }}>
                Name
              </TableCell>
              <TableCell
                align="left"
                className={styles.headingCell}
                sx={{ width: '45%', fontWeight: 'bold' }}
              >
                Email
              </TableCell>
              <TableCell
                align="left"
                className={styles.headingCell}
                sx={{ width: '20%', fontWeight: 'bold' }}
              >
                Role
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              return (
                <MemberDetails
                  key={user.userId}
                  changeRole={changeRole}
                  user={user}
                  removeMember={removeMember}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </ColouredBox>
  );
}
