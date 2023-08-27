import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import AnnouncementBox from './AnnouncementBox';

import { getAllEducatorPosts } from '../../utils/api/forum';

import styles from './CourseDashboard.module.css';
import globalStyles from '../../index.module.css';
import CourseOptions from './CourseOptions';
import { CourseContext } from '../../utils/contexts';

export default function CourseDashboard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courseName } = useContext(CourseContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getAllEducatorPosts(courseId, navigate).then((newPosts) => {
      newPosts.sort((a, b) => b.timePosted - a.timePosted);
      setPosts(newPosts);
    });
  }, [courseId, navigate]);
  return (
    <div className={globalStyles.pageContainer}>
      <div className={styles.courseHeadingContainer}>
        <h2
          className={styles.courseHeading}
          style={{ color: useTheme().palette.custom.defaultFont }}
        >
          {courseName}
        </h2>
        <CourseOptions />
      </div>
      {posts.map((post) => (
        <AnnouncementBox key={post.postId} {...post} />
      ))}
    </div>
  );
}
