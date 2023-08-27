import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { PersonOutline } from '@mui/icons-material';
import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import { toDateString, toTimeString } from '../../../utils/helpers';
import styles from './PostCards.module.css';

export default function PostCard({
  postId,
  title,
  categoryName,
  categoryColor,
  firstName,
  lastName,
  timePosted,
}) {
  const theme = useTheme();
  const params = useParams();
  return (
    <Link
      to={`/${params.courseId}/post/${postId}`}
      style={{
        display: 'block',
        width: '100%',
        textDecoration: 'none',
        color: theme.palette.custom.defaultFont,
      }}
    >
      <ColouredBox
        color={categoryColor}
        height="fit"
        width="100%"
        marginTopBottom="14px"
        marginSide="auto"
        paddingTopBottom="1.5rem"
        paddingSide="2rem"
      >
        <div className={styles.contentContainer}>
          <div className={styles.cardLeftSide}>
            <span className={styles.category}>{categoryName || 'Uncategorised'}</span> &#183;
            <span className={styles.timestamp}>
              {toDateString(new Date(timePosted))} at {toTimeString(new Date(timePosted))}
            </span>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <div className={styles.cardRightSide}>
            <PersonOutline className={styles.personIcon} />{' '}
            <span className={styles.authorName}>
              <strong>
                {firstName} {lastName}
              </strong>
            </span>
          </div>
        </div>
      </ColouredBox>
    </Link>
  );
}
