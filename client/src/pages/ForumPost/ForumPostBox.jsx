import { PersonOutlined } from '@mui/icons-material';
import React, { useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ColouredBox from '../../components/ColouredBox/ColouredBox';
import EditButtons from '../../components/EditButtons';
import RichTextBox from '../../components/RichTextBox/RichTextBox';
import { CourseContext, UserContext } from '../../utils/contexts';
import { deletePost } from '../../utils/api/forum';
import { toDateString, toTimeString } from '../../utils/helpers';
import AttachedFiles from './AttachedFiles';
import styles from './ForumPost.module.css';

export default function ForumPostBox({
  postId,
  posterId,
  title,
  timePosted,
  categoryName,
  categoryColor,
  text,
  firstName,
  lastName,
  files,
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { userId } = useContext(UserContext);
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const handleDelete = () => {
    deletePost(postId, navigate).then(navigate(`/${courseId}/forum`));
  };
  const handleEdit = () => {
    navigate(`/${courseId}/forum/edit/${postId}`);
  };
  return (
    <ColouredBox color={categoryColor} paddingTopBottom="1.5rem" marginTopBottom="0" marginSide="0">
      <div className={styles.headingContainer}>
        <h2 className={styles.postTitle}>{title}</h2>
        {(isTeacher || userId === posterId) && (
          <EditButtons
            helperText={`post ${title}`}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            fontSize="small"
          />
        )}
      </div>
      <div className={styles.postInfo}>
        <PersonOutlined />
        <div>
          <span>
            <strong>
              {firstName} {lastName}
            </strong>
          </span>{' '}
          <br />
          <span>
            {toDateString(new Date(timePosted))} at {toTimeString(new Date(timePosted))} in{' '}
            <strong>{categoryName || 'Uncategorised'}</strong>
          </span>
        </div>
      </div>
      <RichTextBox content={text} />
      <AttachedFiles files={files || []} color={categoryColor} />
    </ColouredBox>
  );
}
