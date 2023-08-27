import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ActiveClassBox from './ActiveClassBox';
import EditClassModal from './EditClassModal';
import ScheduledClassBox from './ScheduledClassBox';
import BottomRightAddButton from '../../components/BottomRightAddButton';
import { createDateTime, getNextEnd } from '../../utils/helpers';
import { CourseContext } from '../../utils/contexts';
import { getClasses } from '../../utils/api/classes';

import styles from './Classes.module.css';
import globalStyles from '../../index.module.css';

function Classes() {
  const { role } = useContext(CourseContext);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const activeClasses = classes.filter(
    (classInfo) => classInfo.startTime <= Date.now() && Date.now() <= classInfo.endTime
  );
  const scheduledClasses = classes.filter((classInfo) => classInfo.startTime > Date.now());
  const handleGetClasses = useCallback(() => {
    getClasses(courseId, navigate)
      .then((data) => {
        setClasses(
          data
            .map((classInfo) => {
              const nextEnd = getNextEnd(new Date(classInfo.endTime), classInfo.frequency);
              const nextStart = createDateTime(nextEnd, new Date(classInfo.startTime));
              return {
                key: classInfo.classId,
                classId: classInfo.classId,
                name: classInfo.className,
                startTime: nextStart,
                endTime: nextEnd,
                frequency: classInfo.frequency,
              };
            })
            .sort((a, b) => a.startTime - b.startTime)
        );
      })
      .catch((err) => console.error(err.message));
  }, [courseId, navigate]);

  useEffect(() => {
    handleGetClasses();
  }, [handleGetClasses]);

  return (
    <div className={globalStyles.pageContainer}>
      <h2 className={globalStyles.pageHeading}>Online Classes</h2>
      {activeClasses.length > 0 && <h3 className={styles.pageSubheading}>Currently Active</h3>}
      {activeClasses.map((classInfo) => (
        <ActiveClassBox {...classInfo} />
      ))}
      {scheduledClasses.length > 0 && <h3 className={styles.pageSubheading}>Scheduled</h3>}
      {scheduledClasses.map((classInfo) => (
        <ScheduledClassBox {...classInfo} isTeacher={isTeacher} getClasses={handleGetClasses} />
      ))}
      {showModal && (
        <EditClassModal
          {...{
            showModal,
            setShowModal,
            getClasses: handleGetClasses,
          }}
        />
      )}
      {isTeacher && (
        <BottomRightAddButton
          tooltipLabel="Create New Class"
          handleAdd={() => setShowModal(true)}
        />
      )}
    </div>
  );
}

export default Classes;
