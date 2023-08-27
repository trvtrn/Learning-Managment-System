import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RankingTable from './RankingTable/RankingTable';
import AchievementCollectionTable from './AchievementCollectionTable/AchievementCollectionTable';
import RedeemCodeInput from './RedeemCodeInput/RedeemCodeInput';
import BottomRightAddButton from '../../components/BottomRightAddButton';
import EditAchievementModal from './AchievementModals/EditAchievementModal';
import {
  getLeaderboard,
  getAllCourseAchievements,
  getOwnAchievements,
  getAllMembersAchievements,
} from '../../utils/api/leaderboard';
import { CourseContext } from '../../utils/contexts';

import globalStyles from '../../index.module.css';

export default function Leaderboard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(CourseContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [memberAchievements, setMemberAchievements] = useState([]);
  const [showEditAchievementModal, setShowEditAchievementModal] = useState(false);

  const refreshRankings = useCallback(() => {
    getLeaderboard(courseId, navigate)
      .then(setLeaderboard)
      .catch((err) => {
        console.error(err.message);
      });
    if (role === 'Creator' || role === 'Educator') {
      getAllMembersAchievements(courseId, navigate)
        .then(setMemberAchievements)
        .catch((err) => console.error(err.message));
    }
  }, [courseId, role, navigate]);

  const refreshAchievements = useCallback(() => {
    if (role === 'Student') {
      getOwnAchievements(courseId, navigate)
        .then(setAllAchievements)
        .catch((err) => {
          console.error(err.message);
        });
    } else if (role === 'Creator' || role === 'Educator') {
      getAllCourseAchievements(courseId, navigate)
        .then(setAllAchievements)
        .catch((err) => {
          console.error(err.message);
        });
    }
  }, [role, courseId, navigate]);

  useEffect(() => {
    refreshRankings();
    refreshAchievements();
  }, [refreshAchievements, refreshRankings]);

  const toggleShowEditModal = useCallback(() => {
    setShowEditAchievementModal((prev) => !prev);
  }, []);

  return (
    <div className={globalStyles.pageContainer}>
      <h2 className={globalStyles.pageHeading}>Leaderboard</h2>
      <RankingTable leaderboard={leaderboard} memberAchievements={memberAchievements} />
      <AchievementCollectionTable
        allAchievements={allAchievements}
        refreshRankings={refreshRankings}
        refreshAchievements={refreshAchievements}
        memberAchievements={memberAchievements}
      />
      {role === 'Student' ? (
        <RedeemCodeInput
          refreshRankings={refreshRankings}
          refreshAchievements={refreshAchievements}
        />
      ) : (
        <BottomRightAddButton
          tooltipLabel="Create New Achievement"
          handleAdd={toggleShowEditModal}
        />
      )}
      {showEditAchievementModal && (
        <EditAchievementModal
          toggleShowEditModal={toggleShowEditModal}
          refreshAchievements={refreshAchievements}
          refreshRankings={refreshRankings}
        />
      )}
    </div>
  );
}
