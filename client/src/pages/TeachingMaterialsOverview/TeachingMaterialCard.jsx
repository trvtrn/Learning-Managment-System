import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import ColouredBox from '../../components/ColouredBox/ColouredBox';
import { toDateString, toTimeString } from '../../utils/helpers';
import styles from './TeachingMaterialsOverview.module.css';
import EditButtons from '../../components/EditButtons';

export default function OverviewCard({ id, title, date, isTeacher, handleDelete }) {
  const theme = useTheme();
  const params = useParams();
  const navigate = useNavigate();
  return (
    <Link
      to={`/${params.courseId}/materials/${id}`}
      style={{
        display: 'block',
        width: '100%',
        textDecoration: 'none',
        color: theme.palette.custom.defaultFont,
      }}
    >
      <ColouredBox
        color="light"
        height="fit"
        width="100%"
        marginTopBottom="1rem"
        marginSide="auto"
        paddingTopBottom="0.5rem"
        paddingSide="2rem"
      >
        <div className={styles.textContainer}>
          <h1 className={styles.cardLeftSide}>{title}</h1>
          <div className={styles.cardRightSide}>
            <h3 className={styles.postTime}>
              Posted {toDateString(date)}
              <br /> at {toTimeString(date)}
            </h3>
            {isTeacher && (
              <EditButtons
                helperText={`material ${title}`}
                fontSize="small"
                handleEdit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/${params.courseId}/materials/edit/${id}`);
                }}
                handleDelete={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(id);
                }}
              />
            )}
          </div>
        </div>
      </ColouredBox>
    </Link>
  );
}
