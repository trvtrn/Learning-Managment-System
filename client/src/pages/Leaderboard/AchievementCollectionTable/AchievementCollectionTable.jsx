import React, { useContext } from 'react';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import AchievementDetails from './AchievementDetails';
import { CourseContext } from '../../../utils/contexts';

import styles from './AchievementCollectionTable.module.css';

export default function AchievementCollectionTable({
  allAchievements,
  refreshRankings,
  refreshAchievements,
  memberAchievements,
}) {
  const { role } = useContext(CourseContext);
  return (
    <>
      {role === 'Student' ? (
        <h3 className={styles.subheading}>My Achievements</h3>
      ) : (
        <h3 className={styles.subheading}>Course Achievements</h3>
      )}

      <ColouredBox color="light" paddingTopBottom="1rem" marginSide={0} marginTopBottom="1rem">
        <TableContainer>
          <Table aria-label="all students leaderboard rankings">
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold', width: '15%' }}>
                  Code
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 'bold', width: '70%' }}>
                  Achievement
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: '5%' }}>
                  Tier
                </TableCell>
                {role !== 'Student' && <TableCell sx={{ fontWeight: 'bold', width: '10%' }} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {allAchievements.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan="100%" sx={{ borderBottom: 'none' }}>
                    No Achievements Yet
                  </TableCell>
                </TableRow>
              ) : (
                allAchievements.map((achievement) => {
                  return (
                    <AchievementDetails
                      key={achievement.achievementCode}
                      code={achievement.achievementCode}
                      name={achievement.achievementName}
                      type={achievement.type}
                      refreshRankings={refreshRankings}
                      refreshAchievements={refreshAchievements}
                      membersNotAwarded={memberAchievements.filter(
                        ({ achievements }) =>
                          !achievements.some(
                            ({ achievementCode }) => achievementCode === achievement.achievementCode
                          )
                      )}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </ColouredBox>
    </>
  );
}
