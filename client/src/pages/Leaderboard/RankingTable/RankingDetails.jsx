import React, { useContext } from 'react';

import { Collapse, IconButton, TableCell, TableRow } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

import AchievementCount from './RankingMedal';
import StudentAchievementBreakdown from './StudentAchievementBreakdown';
import { CourseContext } from '../../../utils/contexts';

export default function RankingDetails({ details, isOpen, toggleOpen, achievements }) {
  const { role } = useContext(CourseContext);
  return (
    <>
      <TableRow sx={{ height: '3.85rem' }}>
        <TableCell align="center" sx={{ borderBottom: 'none' }}>
          {details.rank}
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>
          {details.firstName} {details.lastName}
        </TableCell>
        <TableCell sx={{ borderBottom: 'none' }}>{details.email}</TableCell>
        <TableCell
          align="center"
          sx={{ borderBottom: 'none', display: 'flex', justifyContent: 'center' }}
        >
          <AchievementCount type="Gold" number={details.gold} />
          <AchievementCount type="Silver" number={details.silver} />
          <AchievementCount type="Bronze" number={details.bronze} />
        </TableCell>
        {(role === 'Creator' || role === 'Educator') && (
          <TableCell sx={{ borderBottom: 'none' }}>
            <IconButton size="small" onClick={() => toggleOpen(details.userId)}>
              {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell sx={{ padding: 0, borderBottom: 'none' }} colSpan={5}>
          <Collapse in={isOpen} timeout="auto">
            <StudentAchievementBreakdown {...details} achievements={achievements} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
