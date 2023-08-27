import React from 'react';
import { useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { formatDate } from '../../../utils/helpers';
import styles from './UpcomingTasks.module.css';

export default function UpcomingTask({ id, type, taskName, dueDate, courseName, courseId }) {
  const theme = useTheme();
  let link;
  let tagColor;
  if (type === 'Assignment') {
    link = `/${courseId}/assignments/${id}`;
    tagColor = theme.palette.custom.pink;
  } else if (type === 'Quiz') {
    link = `/${courseId}/quiz/${id}`;
    tagColor = theme.palette.custom.green;
  } else {
    link = `/${courseId}/classes`;
    tagColor = theme.palette.custom.blue;
  }
  return (
    <Link to={link} style={{ textDecoration: 'none', color: theme.palette.custom.defaultFont }}>
      <div className={styles.homeTask}>
        <div className={styles.homeTaskDetails}>
          <span className={styles.homeTaskCourse}>{courseName}</span>
          <span className={styles.homeTaskDueDate}>{formatDate(new Date(dueDate))}</span>
        </div>
        <div className={styles.homeTaskDetails}>
          <h4 className={styles.homeTaskTitle}>{taskName}</h4>
          <span className={styles.homeTaskType} style={{ backgroundColor: tagColor }}>
            {type}
          </span>
        </div>
      </div>
    </Link>
  );
}
