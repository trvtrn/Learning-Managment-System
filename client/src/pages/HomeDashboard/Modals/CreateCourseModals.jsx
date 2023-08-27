import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddMembersModal from './AddMembersModal';
import EditCourseNameModal from './EditCourseNameModal';
import { createCourse } from '../../../utils/api/courses';

function CreateCourseModals({ toggleCreateCourse }) {
  const navigate = useNavigate();
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const handleCourseNameSubmit = () => {
    setShowAddMembersModal(true);
  };
  const handleSubmit = (members, onError) => {
    createCourse(courseName, members, navigate)
      .then((data) => {
        navigate(`/course/${data.courseId}`);
      })
      .catch((err) => {
        onError(err);
        console.error(err.message);
      });
  };
  return (
    <>
      <EditCourseNameModal
        open={!showAddMembersModal}
        onClose={toggleCreateCourse}
        handleSubmit={handleCourseNameSubmit}
        courseName={courseName}
        setCourseName={setCourseName}
      />
      <AddMembersModal
        open={showAddMembersModal}
        onClose={toggleCreateCourse}
        handleSubmit={handleSubmit}
        courseName={courseName}
      />
    </>
  );
}

export default CreateCourseModals;
