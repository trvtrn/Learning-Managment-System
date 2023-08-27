import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';

import ColouredBox from '../../components/ColouredBox/ColouredBox';
import EditButtons from '../../components/EditButtons';

import styles from './AssignmentsOverview.module.css';
import { formatDate } from '../../utils/helpers';

export default function AssignmentCard({
  id,
  name,
  dueDate,
  deleteAssignment,
  isTeacher,
  published,
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { courseId } = useParams();

  return (
    <Link
      to={`/${courseId}/assignments/${id}`}
      style={{ textDecoration: 'none', color: theme.palette.custom.defaultFont }}
    >
      <ColouredBox
        marginSide="0"
        marginTopBottom="1rem"
        color={published ? 'info' : 'light'}
        paddingSide="2rem"
        paddingTopBottom="0.5rem"
      >
        <div className={styles.cardContainer}>
          <h2 className={styles.assignmentName}>{name}</h2>
          <div className={styles.cardRightSide}>
            <h6 className={styles.dueDate}>Due: {formatDate(new Date(dueDate))}</h6>
            {isTeacher && (
              <EditButtons
                fontSize="small"
                helperText={`assignment ${name}`}
                handleEdit={(e) => {
                  e.stopPropagation();
                  navigate(`/${courseId}/assignments/edit/${id}`);
                }}
                handleDelete={(e) => {
                  e.stopPropagation();
                  deleteAssignment(id);
                }}
              />
            )}
          </div>
        </div>
      </ColouredBox>
    </Link>
  );
}
