import React from 'react';

import CourseBox from './CourseBox';

import styles from '../HomeDashboard.module.css';
import courseStyles from './Courses.module.css';

export default function Courses({ courses }) {
  return courses.length === 0 ? (
    <div className={styles.homeEmpty}>You are not part of any courses</div>
  ) : (
    <div className={courseStyles.homeCourseBoxContainer}>
      {courses.map((course) => (
        <CourseBox {...course} />
      ))}
    </div>
  );
}
