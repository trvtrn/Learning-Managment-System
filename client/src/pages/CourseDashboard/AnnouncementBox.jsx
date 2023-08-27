import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { PersonOutline } from '@mui/icons-material';

import ColouredBox from '../../components/ColouredBox/ColouredBox';
import RichTextBox from '../../components/RichTextBox/RichTextBox';

import styles from './CourseDashboard.module.css';
import { toDateString, toTimeString } from '../../utils/helpers';

function AnnouncementBox({
  postId,
  categoryName,
  categoryColor,
  title,
  text,
  firstName,
  lastName,
  timePosted,
}) {
  const { courseId } = useParams();
  return (
    <ColouredBox
      color={categoryColor}
      marginTopBottom="20px"
      paddingTopBottom="30px"
      marginSide="0"
      paddingSide="50px"
    >
      <div className={styles.courseAnnouncementHeader}>
        <h3 className={styles.courseAnnouncementHeading}>{title}</h3>
        <Link className={styles.link} to={`/${courseId}/post/${postId}`}>
          Go to post
        </Link>
      </div>
      <RichTextBox content={text} />
      <div className={styles.courseAnnouncementDetails}>
        <div className={styles.courseAnnouncementCreatorContainer}>
          <PersonOutline
            className={styles.coursePersonIcon}
            sx={{ color: useTheme().palette.custom.defaultFont }}
          />
          <div className={styles.courseAnnouncementCreator}>
            {firstName} {lastName}
          </div>
        </div>
        <div className={styles.courseAnnouncementTime}>
          {toDateString(new Date(timePosted))} at {toTimeString(new Date(timePosted))} in{' '}
          <strong>{categoryName || 'Uncategorised'}</strong>
        </div>
      </div>
    </ColouredBox>
  );
}

export default AnnouncementBox;
