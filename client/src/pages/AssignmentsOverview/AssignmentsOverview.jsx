import React, { useCallback, useState, useMemo, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AssignmentCard from './AssignmentCard';
import BottomRightAddButton from '../../components/BottomRightAddButton';

import { deleteAssignment, getAllAssignments } from '../../utils/api/assignments';
import { CourseContext } from '../../utils/contexts';

import globalStyles from '../../index.module.css';

export default function AssignmentsOverview() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { role } = useContext(CourseContext);
  const [assignments, setAssignments] = useState([]);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const publishedAssignments = useMemo(
    () =>
      assignments.filter((assignment) => {
        return assignment.releaseDate <= Date.now();
      }),
    [assignments]
  );

  const unpublishedAssignments = useMemo(
    () =>
      assignments.filter((assignment) => {
        return Date.now() < assignment.releaseDate;
      }),
    [assignments]
  );

  const renderPage = useCallback(() => {
    getAllAssignments(courseId, navigate)
      .then(setAssignments)
      .catch((err) => {
        console.error(err.message);
      });
  }, [courseId, navigate]);

  const handleDeleteAssignment = (id) => {
    deleteAssignment(id, navigate)
      .then(renderPage)
      .catch((err) => {
        console.error(err.message);
      });
  };
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  return (
    <div className={globalStyles.pageContainer}>
      <h2 className={globalStyles.pageHeading}>Assignments</h2>
      {isTeacher && publishedAssignments.length > 0 && <h3>Published</h3>}
      {publishedAssignments.map((assignment) => {
        return (
          <AssignmentCard
            key={assignment.assignmentId}
            published
            id={assignment.assignmentId}
            name={assignment.assignmentName}
            dueDate={assignment.dueDate}
            deleteAssignment={handleDeleteAssignment}
            isTeacher={isTeacher}
          />
        );
      })}
      {isTeacher && (
        <>
          {unpublishedAssignments.length > 0 && <h3>Unpublished</h3>}
          {unpublishedAssignments.map((assignment) => {
            return (
              <AssignmentCard
                key={assignment.assignmentId}
                id={assignment.assignmentId}
                name={assignment.assignmentName}
                dueDate={assignment.dueDate}
                deleteAssignment={handleDeleteAssignment}
                isTeacher
              />
            );
          })}
        </>
      )}
      {isTeacher && (
        <BottomRightAddButton
          tooltipLabel="Create New Assignment"
          handleAdd={() => {
            navigate(`/${courseId}/assignments/edit`);
          }}
        />
      )}
    </div>
  );
}
