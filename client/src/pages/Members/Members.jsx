import { React, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AddMembersModal from '../HomeDashboard/Modals/AddMembersModal';
import MembersTable from './MembersTable';
import AddButton from '../../components/AddButton';
import { compareMembers } from '../../utils/helpers';
import { addMembers, deleteMember, getMembers, updateMemberRole } from '../../utils/api/members';
import { CourseContext } from '../../utils/contexts';

import globalStyles from '../../index.module.css';
import styles from './Members.module.css';

export default function Members() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { role } = useContext(CourseContext);
  const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);
  const [creator, setCreator] = useState({
    userId: 0,
    firstName: '',
    lastName: '',
    email: '',
    role: 'Creator',
  });
  const [educators, setEducators] = useState([]);
  const [students, setStudents] = useState([]);

  const fillPageDetails = useCallback(
    () =>
      getMembers(courseId, navigate)
        .then((data) => {
          setCreator(
            data.find((user) => {
              return user.role === 'Creator';
            })
          );
          setEducators(
            data
              .filter((user) => {
                return user.role === 'Educator';
              })
              .sort(compareMembers)
          );
          setStudents(
            data
              .filter((user) => {
                return user.role === 'Student';
              })
              .sort(compareMembers)
          );
        })
        .catch((err) => console.error(err.message)),
    [courseId, navigate]
  );

  const changeRole = (newRole, id) => {
    updateMemberRole(id, courseId, newRole, navigate)
      .then(fillPageDetails)
      .catch((err) => console.error(err.message));
  };

  const removeMember = (userId) => {
    deleteMember(courseId, userId)
      .then(fillPageDetails)
      .catch((err) => console.error(err.message));
  };

  useEffect(() => {
    fillPageDetails();
  }, [fillPageDetails]);

  const toggleAddMembersModal = () => {
    setAddMembersModalOpen(addMembersModalOpen === false);
  };

  const handleAddMembers = (members, onError) => {
    addMembers(courseId, members, navigate)
      .then(() => {
        toggleAddMembersModal();
        fillPageDetails();
      })
      .catch((err) => {
        onError(err);
        console.error(err.message);
      });
  };

  return (
    <div className={globalStyles.pageContainer}>
      <div className={styles.headingContainer}>
        <h2 className={styles.pageHeading}>Members</h2>
        {role === 'Creator' && (
          <AddButton tooltipLabel="Add New Members" handleAdd={toggleAddMembersModal} />
        )}
      </div>
      <MembersTable
        changeRole={changeRole}
        users={[creator, ...educators, ...students]}
        removeMember={removeMember}
      />
      {addMembersModalOpen && (
        <AddMembersModal
          open={addMembersModalOpen}
          onClose={toggleAddMembersModal}
          handleSubmit={handleAddMembers}
          hideSkipButton
        />
      )}
    </div>
  );
}
