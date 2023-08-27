import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import SideBar from '../../components/Sidebar/SideBar';

import NavLayout from '../NavLayout/NavLayout';
import { CourseContext } from '../../utils/contexts';

import styles from './SideBarLayout.module.css';
import { getRole } from '../../utils/api/members';
import { getCourse } from '../../utils/api/courses';

export default function SideBarLayout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [role, setRole] = useState('');
  useEffect(() => {
    getRole(courseId, navigate)
      .then(setRole)
      .catch((err) => console.error(err.message));
    getCourse(courseId, navigate)
      .then((data) => setCourseName(data.courseName))
      .catch((err) => console.error(err.message));
  }, [courseId, navigate]);
  return (
    <CourseContext.Provider value={{ courseName, setCourseName, role }}>
      <NavLayout>
        <SideBar />
        <div className={styles.innerPageContainer}>
          <Outlet />
        </div>
      </NavLayout>
    </CourseContext.Provider>
  );
}
