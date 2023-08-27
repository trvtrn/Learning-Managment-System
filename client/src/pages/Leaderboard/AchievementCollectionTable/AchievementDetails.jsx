import React, { useState, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { EmojiEvents, PersonAddAlt1 } from '@mui/icons-material';
import CopyButton from '../../../components/CopyButton';
import EditButtons from '../../../components/EditButtons';
import EditAchievementModal from '../AchievementModals/EditAchievementModal';
import AwardAchievementModal from '../AchievementModals/AwardAchievementModal';
import { ACHIEVEMENT_COLORS } from '../../../utils/constants';
import { CourseContext } from '../../../utils/contexts';
import { deleteAchievement } from '../../../utils/api/leaderboard';

export default function AchievementDetails({
  code,
  name,
  type,
  refreshRankings,
  refreshAchievements,
  membersNotAwarded,
}) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(CourseContext);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);

  const toggleShowEditModal = useCallback(() => {
    setShowEditModal((prev) => !prev);
  }, []);
  const toggleShowAwardModal = useCallback(() => {
    setShowAwardModal((prev) => !prev);
  }, []);

  const handleDelete = () => {
    deleteAchievement(courseId, code, navigate).then(() => {
      refreshRankings();
      refreshAchievements();
    });
  };

  return (
    <TableRow>
      <TableCell sx={{ borderBottom: 'none' }}>
        {code}
        {role !== 'Student' && <CopyButton text={code} changeColour size="small" />}
      </TableCell>
      <TableCell sx={{ borderBottom: 'none' }}>{name}</TableCell>
      <TableCell align="center" sx={{ borderBottom: 'none' }}>
        <EmojiEvents
          fontSize="medium"
          sx={{ display: 'block', margin: '0 auto', color: ACHIEVEMENT_COLORS[type] }}
        />
      </TableCell>
      {role !== 'Student' && (
        <TableCell align="right" sx={{ borderBottom: 'none' }}>
          <div style={{ display: 'flex', margin: '0 auto', width: 'fit-content' }}>
            <Tooltip title="Award a Student" placement="top">
              <IconButton
                onClick={() => {
                  toggleShowAwardModal();
                }}
              >
                <PersonAddAlt1 fontSize="small" />
              </IconButton>
            </Tooltip>
            <EditButtons
              handleEdit={() => {
                toggleShowEditModal();
              }}
              handleDelete={handleDelete}
              fontSize="small"
              helperText="this achievement"
            />
          </div>
          {showEditModal && (
            <EditAchievementModal
              existingAchievementName={name}
              existingAchievementCode={code}
              existingAchievementType={type}
              toggleShowEditModal={toggleShowEditModal}
              refreshAchievements={refreshAchievements}
              refreshRankings={refreshRankings}
            />
          )}
          {showAwardModal && (
            <AwardAchievementModal
              name={name}
              type={type}
              code={code}
              toggleShowAwardModal={toggleShowAwardModal}
              refreshRankings={refreshRankings}
              membersNotAwarded={membersNotAwarded}
            />
          )}
        </TableCell>
      )}
    </TableRow>
  );
}
