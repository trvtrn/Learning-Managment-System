import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import styles from './Courses.module.css';

export default function CourseBox({ courseId, courseName, creatorName }) {
  const theme = useTheme();

  return (
    <Link
      to={`/course/${courseId}`}
      className={styles.homeCourseLink}
      style={{
        color: theme.palette.custom.defaultFont,
      }}
    >
      <ColouredBox
        width="100%"
        marginTopBottom="0"
        marginBottom="0.5rem"
        marginSide="0"
        paddingTopBottom="2rem"
        paddingSide="0.5rem"
        color="purple"
      >
        <div className={styles.homeCourseBox}>
          <h4 className={styles.homeCourseName}>{courseName}</h4>
          <div className={styles.homeCourseCreatorContainer}>
            <PersonOutlined sx={{ width: 40, height: 40, color: theme.palette.primary.main }} />
            <p className={styles.homeCourseCreator}>{creatorName}</p>
          </div>
        </div>
      </ColouredBox>
    </Link>
  );
}
