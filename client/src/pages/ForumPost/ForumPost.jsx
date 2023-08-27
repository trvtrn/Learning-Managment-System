import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ForumPostBox from './ForumPostBox';
import ForumReplyBox from './ForumReplyBox';
import ForumReplyEditBox from './ForumReplyEditBox';
import { deleteReply, getPost, createOrUpdateReply } from '../../utils/api/forum';
import { isBlank } from '../../utils/helpers';
import { CourseContext } from '../../utils/contexts';
import globalStyles from '../../index.module.css';
import styles from './ForumPost.module.css';

export default function ForumPost() {
  const { courseId, postId } = useParams();
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    firstName: '',
    lastName: '',
    timePosted: new Date(),
    categoryName: '',
    categoryColor: '',
    text: '',
  });
  const [editingPosts, setEditingPosts] = useState(new Set());
  const [replies, setReplies] = useState([]);
  const [showAnswerEditor, setShowAnswerEditor] = useState(false);

  const addEditingPost = (replyId) => {
    setEditingPosts((prev) => {
      const newEditingPosts = new Set(prev);
      newEditingPosts.add(replyId);
      return newEditingPosts;
    });
  };

  const removeEditingPost = (replyId) => {
    if (!replyId) {
      setShowAnswerEditor(false);
      return;
    }
    setEditingPosts((prev) => {
      const newEditingPosts = new Set(prev);
      newEditingPosts.delete(replyId);
      return newEditingPosts;
    });
  };

  const handleDeleteReply = (replyId) => {
    deleteReply(replyId, navigate)
      .then(() => getPost(postId, navigate))
      .then((data) => {
        setPost(data);
        setReplies(data.replies);
      });
  };

  const handleSubmit = (replyId, content, files, setErrorMessage) => {
    if (isBlank(content)) {
      setErrorMessage('Do not leave reply blank');
      return;
    }
    createOrUpdateReply(parseInt(postId, 10), replyId, content, files, navigate)
      .then(() => getPost(postId, navigate))
      .then((data) => {
        setPost(data);
        setReplies(data.replies);
        if (!replyId) {
          setShowAnswerEditor(false);
        } else {
          removeEditingPost(replyId);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message);
        console.error(err.message);
      });
  };

  useEffect(() => {
    getPost(postId, navigate)
      .then((data) => {
        setPost(data);
        setReplies(data.replies);
      })
      .catch((err) => console.error(err.message));
  }, [courseId, postId, navigate]);

  return (
    <div className={globalStyles.pageContainer}>
      <ForumPostBox postId={postId} posterId={post.userId} {...post} isTeacher={isTeacher} />
      <h3 className={styles.pageSubheading}>{replies.length} Replies</h3>
      {replies.map((reply) =>
        editingPosts.has(reply.replyId) ? (
          <ForumReplyEditBox
            key={reply.replyId}
            replyId={reply.replyId}
            removeEditingPost={removeEditingPost}
            handleSubmit={handleSubmit}
            isEdit
          />
        ) : (
          <ForumReplyBox
            key={reply.replyId}
            posterId={reply.userId}
            {...reply}
            addEditingPost={addEditingPost}
            handleDelete={handleDeleteReply}
            isTeacher={isTeacher}
          />
        )
      )}
      {showAnswerEditor ? (
        <ForumReplyEditBox handleSubmit={handleSubmit} removeEditingPost={removeEditingPost} />
      ) : (
        <Button
          onClick={() => setShowAnswerEditor(true)}
          variant="contained"
          sx={{ display: 'block', margin: '0 auto' }}
        >
          Add reply
        </Button>
      )}
    </div>
  );
}
