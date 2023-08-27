import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import ColouredBox from '../../components/ColouredBox/ColouredBox';
import EditButtons from '../../components/EditButtons';

import styles from './Classes.module.css';
import { toTimeString, toDateString } from '../../utils/helpers';
import EditClassModal from './EditClassModal';
import { deleteClass } from '../../utils/api/classes';

function ScheduledClassBox({
  classId,
  name,
  startTime,
  endTime,
  frequency,
  isTeacher,
  getClasses,
}) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const handleDelete = () => {
    deleteClass(classId, navigate)
      .then(getClasses)
      .catch((err) => console.error(err.message));
  };
  return (
    <>
      <ColouredBox color="light" marginTopBottom="1rem" paddingTopBottom="1rem" marginSide="0">
        <div className={styles.classBox}>
          <h3 className={styles.classLabel}>{name}</h3>
          <div className={styles.classBox}>
            <div className={styles.classDetails}>
              <span>
                <strong>Date:</strong> {toDateString(startTime)}
              </span>
              <br />
              <span>
                <strong>Start:</strong> {toTimeString(startTime)}
              </span>
              <br />
              <span>
                <strong>End:</strong> {toTimeString(endTime)}
              </span>
              <br />
              <span>
                <strong>Frequency:</strong> {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </span>
            </div>
            {isTeacher && (
              <EditButtons
                fontSize="small"
                helperText={`class ${name}`}
                handleEdit={() => setShowModal(true)}
                handleDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </ColouredBox>
      {showModal && (
        <EditClassModal
          classId={classId}
          name={name}
          frequency={frequency}
          date={dayjs(startTime)}
          startTime={dayjs(startTime)}
          endTime={dayjs(endTime)}
          showModal={showModal}
          setShowModal={setShowModal}
          getClasses={getClasses}
        />
      )}
    </>
  );
}

export default ScheduledClassBox;
