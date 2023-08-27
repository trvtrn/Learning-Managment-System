import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AttachFilesInput from '../../components/AttachFilesInput/AttachFilesInput';
import ColouredBox from '../../components/ColouredBox/ColouredBox';
import FormFooter from '../../components/FormFooter/FormFooter';
import RichTextInput from '../../components/RichTextInput';
import { getReply } from '../../utils/api/forum';
import { getAllFiles } from '../../utils/api/file';
import styles from './ForumPost.module.css';

export default function ForumReplyEditBox({ replyId, isEdit, handleSubmit, removeEditingPost }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!replyId) {
      return;
    }
    getReply(replyId, navigate).then((data) => {
      setContent(data.text);
      getAllFiles(data.files).then(setFiles);
    });
  }, [replyId, navigate]);

  return (
    <ColouredBox color={isEdit && 'light'} paddingTopBottom="1.5rem">
      <form
        className={styles.replyForm}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(replyId, content, files, setErrorMessage);
        }}
      >
        <RichTextInput
          label={isEdit ? 'Edit Answer' : 'Your Answer'}
          id="answer"
          value={content}
          onChange={setContent}
          isSticky={false}
        />
        <AttachFilesInput
          files={files}
          setFiles={setFiles}
          fontSize="0.85rem"
          label="Attach Files: "
          small
        />
        <FormFooter errorMessage={errorMessage} onCancel={() => removeEditingPost(replyId)} />
      </form>
    </ColouredBox>
  );
}
