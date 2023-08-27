import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from '@mui/material';
import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import { getQuizzes } from '../../../utils/api/quizzes';
import { getAllAssignments } from '../../../utils/api/assignments';
import { getClasses } from '../../../utils/api/classes';
import { createKeyGenerator, getNextEnd, createDateTime } from '../../../utils/helpers';
import { getRole } from '../../../utils/api/members';

import styles from '../HomeDashboard.module.css';
import UpcomingTask from './UpcomingTask';

export default function UpcomingTasks({ courses }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const getNextKey = useMemo(() => createKeyGenerator(), []);
  useEffect(() => {
    Promise.all(
      courses.map(async ({ courseId, courseName }) => {
        const role = await getRole(courseId, navigate);
        if (role !== 'Student') {
          return [];
        }
        const assignments = await getAllAssignments(courseId, navigate);
        const quizzes = await getQuizzes(courseId, navigate);
        const classes = await getClasses(courseId, navigate);
        return [
          ...assignments
            .filter(({ releaseDate, dueDate }) => releaseDate < Date.now() && Date.now() < dueDate)
            .map((assignment) => ({
              type: 'Assignment',
              key: getNextKey(),
              id: assignment.assignmentId,
              courseId,
              courseName,
              taskName: assignment.assignmentName,
              dueDate: assignment.dueDate,
            })),
          ...quizzes
            .filter(({ releaseDate, dueDate }) => releaseDate < Date.now() && Date.now() < dueDate)
            .map((quiz) => ({
              type: 'Quiz',
              key: getNextKey(),
              id: quiz.quizId,
              courseId,
              courseName,
              dueDate: quiz.dueDate,
              taskName: quiz.name,
            })),
          ...classes
            .filter(({ startTime, endTime, frequency }) => {
              const nextEnd = getNextEnd(new Date(endTime), frequency);
              return Date.now() < nextEnd.getTime();
            })
            .map((classInfo) => ({
              type: 'Class',
              key: getNextKey(),
              id: classInfo.classId,
              courseId,
              courseName,
              taskName: classInfo.className,
              dueDate: createDateTime(
                getNextEnd(new Date(classInfo.endTime), classInfo.frequency),
                new Date(classInfo.startTime)
              ),
            })),
        ];
      })
    )
      .then((allTasks) => setTasks(allTasks.flat(2).sort((a, b) => a.dueDate - b.dueDate)))
      .catch((err) => console.error(err.message));
  }, [courses, getNextKey, navigate]);
  return (
    <ColouredBox
      color="info"
      width="100%"
      marginSide="0px"
      marginTopBottom="20px"
      paddingTopBottom="0px"
      paddingSide="20px"
    >
      {tasks.length === 0 ? (
        <div className={styles.homeTask}>
          <div className={styles.homeEmpty}>No Upcoming Tasks</div>
        </div>
      ) : (
        tasks.map((task, idx) => (
          <div key={task.key}>
            <UpcomingTask {...task} />
            {idx === tasks.length - 1 || <Divider />}
          </div>
        ))
      )}
    </ColouredBox>
  );
}
