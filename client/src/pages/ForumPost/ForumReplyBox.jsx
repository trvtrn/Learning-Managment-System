import React, { useContext, useMemo } from 'react';
import { PersonOutlined } from '@mui/icons-material';
import ColouredBox from '../../components/ColouredBox/ColouredBox';
import EditButtons from '../../components/EditButtons';
import RichTextBox from '../../components/RichTextBox/RichTextBox';
import AttachedFiles from './AttachedFiles';
import { toDateString, toTimeString } from '../../utils/helpers';
import { CourseContext, UserContext } from '../../utils/contexts';
import styles from './ForumPost.module.css';

export default function ForumReplyBox({
  replyId,
  posterId,
  firstName,
  lastName,
  timeSent,
  text,
  files,
  addEditingPost,
  handleDelete,
}) {
  const { userId } = useContext(UserContext);
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  return (
    <ColouredBox color="light" paddingTopBottom="1.5rem">
      <div className={styles.headingContainer}>
        <div className={styles.postInfo}>
          <PersonOutlined />
          <div>
            <span>
              <strong>
                {firstName} {lastName}
              </strong>{' '}
            </span>{' '}
            <br />
            <span>
              {toTimeString(new Date(timeSent))} on {toDateString(new Date(timeSent))}
            </span>
          </div>
        </div>
        {(isTeacher || userId === posterId) && (
          <EditButtons
            fontSize="small"
            helperText="this reply"
            handleEdit={() => addEditingPost(replyId)}
            handleDelete={() => handleDelete(replyId)}
          />
        )}
      </div>
      <RichTextBox content={text} />
      <AttachedFiles files={files} />
    </ColouredBox>
  );
}
