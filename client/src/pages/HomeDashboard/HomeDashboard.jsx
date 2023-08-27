import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

import CreateCourseModals from './Modals/CreateCourseModals';
import Courses from './Courses/Courses';
import UpcomingTasks from './UpcomingTasks/UpcomingTasks';
import AddButton from '../../components/AddButton';
import ChatBot from '../../components/ChatBot/ChatBot';
import { UserContext } from '../../utils/contexts';
import { getCourses } from '../../utils/api/courses';

import globalStyles from '../../index.module.css';
import styles from './HomeDashboard.module.css';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [createCourseModalOpen, setCreateCourseModalOpen] = useState(false);
  const { firstName } = useContext(UserContext);

  const [showChatbot, setShowChatbot] = useState(false);

  const handleShowChatbot = () => {
    setShowChatbot((prevState) => !prevState);
  };

  const toggleCreateCourse = () => {
    setCreateCourseModalOpen((prev) => !prev);
  };

  useEffect(() => {
    getCourses(navigate)
      .then((data) => {
        setCourses(
          data.map((course) => ({
            courseId: course.courseId,
            key: course.courseId,
            courseName: course.courseName,
            creatorName: `${course.firstName} ${course.lastName}`,
          }))
        );
      })
      .catch((err) => console.error(err.message));
  }, [navigate]);

  return (
    <div className={globalStyles.pageContainer}>
      <div className={styles.homeGreetingContainer}>
        <h1 className={styles.homeGreeting}>Hi {firstName}</h1>
        <AddButton tooltipLabel="Create New Course" handleAdd={toggleCreateCourse} />
      </div>
      <div className={styles.homeTaskCourseContainer}>
        <div className={styles.homeSectionContainer}>
          <h2 className={styles.homeColumnHeading}>Your Tasks</h2>
          <UpcomingTasks courses={courses} />
        </div>
        <div className={styles.homeSectionContainer}>
          <h2 className={styles.homeColumnHeading}>Your Courses</h2>
          <Courses courses={courses} />
        </div>
      </div>
      {createCourseModalOpen && <CreateCourseModals toggleCreateCourse={toggleCreateCourse} />}
      <div>
        <Tooltip title="Chat to ToodlesGPT">
          <IconButton
            size="large"
            sx={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}
            onClick={handleShowChatbot}
          >
            <QuestionAnswerIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        {showChatbot && <ChatBot setShowChatbot={setShowChatbot} firstName={firstName} />}
      </div>
    </div>
  );
}
