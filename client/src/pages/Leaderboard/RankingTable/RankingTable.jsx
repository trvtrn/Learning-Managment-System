import React, { useContext, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import RankingDetails from './RankingDetails';
import { CourseContext } from '../../../utils/contexts';

export default function Rankings({ leaderboard, memberAchievements }) {
  const [openId, setOpenId] = useState(0);
  const { role } = useContext(CourseContext);
  const toggleOpen = (id) => {
    setOpenId((prev) => {
      if (prev === id) {
        return 0;
      }
      return id;
    });
  };
  return (
    <ColouredBox color="info" paddingTopBottom="1rem" marginTopBottom="1rem">
      <TableContainer>
        <Table aria-label="all students leaderboard rankings" size="large">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: 0 }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Email</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>
                Achievements
              </TableCell>
              {(role === 'Creator' || role === 'Educator') && <TableCell sx={{ width: 0 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.length > 0 ? (
              leaderboard.map((details, i) => {
                return (
                  <RankingDetails
                    key={details.userId}
                    isOpen={openId === details.userId}
                    toggleOpen={toggleOpen}
                    details={details}
                    achievements={
                      memberAchievements.find(({ userId }) => userId === details.userId)
                        ?.achievements || []
                    }
                  />
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ borderBottom: 'none' }}>
                  No members have been added to the course yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </ColouredBox>
  );
}
