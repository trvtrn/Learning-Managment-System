import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconButton, Button, Popover } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import EditCourseNameModal from '../HomeDashboard/Modals/EditCourseNameModal';
import DeleteWarningModal from '../../components/DeleteWarningModal';
import { deleteCourse, updateCourse } from '../../utils/api/courses';
import { deleteMember } from '../../utils/api/members';
import { CourseContext, UserContext } from '../../utils/contexts';

const PopoverButton = styled(Button)(() => ({
  fontSize: 'var(--normalText)',
  fontWeight: 'normal',
  color: 'black',
  minWidth: 0,
  width: '100%',
  borderRadius: 0,
  padding: '0.5rem 0.5rem',
  display: 'block',
  margin: '0 auto',
}));

function CourseOptions() {
  const { courseId } = useParams();
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  const { role, courseName, setCourseName } = useContext(CourseContext);
  const [showPopover, setShowPopover] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const togglePopover = (e) => {
    setShowPopover((prev) => !prev);
    setAnchorEl(e.currentTarget);
  };
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');

  useEffect(() => {
    setNewCourseName(courseName);
  }, [courseName]);

  const handleLeave = () => {
    deleteMember(courseId, userId, navigate)
      .then(() => {
        navigate('/home');
      })
      .catch((err) => console.error(err.message));
  };

  const handleDelete = () => {
    deleteCourse(courseId, navigate)
      .then(() => {
        navigate('/home');
      })
      .catch((err) => console.error(err.message));
  };

  const handleEditCourseName = () => {
    updateCourse(courseId, newCourseName, navigate)
      .then(() => {
        setShowEditCourseModal(false);
        setCourseName(newCourseName);
      })
      .catch((err) => console.error(err.message));
  };

  return (
    <>
      <IconButton aria-describedby="courseOptions" onClick={togglePopover}>
        <MoreHoriz fontSize="large" />
      </IconButton>
      <Popover
        id="courseOptions"
        open={showPopover}
        onClose={togglePopover}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {role !== 'Creator' && (
          <PopoverButton sx={{ color: 'red' }} onClick={() => setShowLeaveModal(true)}>
            Leave Course
          </PopoverButton>
        )}
        {role === 'Creator' && (
          <PopoverButton onClick={() => setShowEditCourseModal(true)}>Edit Course</PopoverButton>
        )}
        {role === 'Creator' && (
          <PopoverButton sx={{ color: 'red' }} onClick={() => setShowDeleteModal(true)}>
            Delete Course
          </PopoverButton>
        )}
      </Popover>
      {showEditCourseModal && (
        <EditCourseNameModal
          open={showEditCourseModal}
          onClose={() => setShowEditCourseModal(false)}
          handleSubmit={handleEditCourseName}
          courseId={courseId}
          courseName={newCourseName}
          setCourseName={setNewCourseName}
        />
      )}
      {showLeaveModal && (
        <DeleteWarningModal
          action="leave"
          helperText={courseName}
          expectedInput={courseName}
          handleDelete={handleLeave}
          setShowModal={setShowLeaveModal}
        />
      )}
      {showDeleteModal && (
        <DeleteWarningModal
          isImportant
          helperText={courseName}
          expectedInput={courseName}
          handleDelete={handleDelete}
          setShowModal={setShowDeleteModal}
        />
      )}
    </>
  );
}

export default CourseOptions;
