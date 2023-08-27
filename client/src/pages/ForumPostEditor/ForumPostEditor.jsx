import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

import RichTextInput from '../../components/RichTextInput';
import TitleInput from '../../components/TitleInput';
import AttachFilesInput from '../../components/AttachFilesInput/AttachFilesInput';
import { getCategories, getPost, createOrUpdatePost } from '../../utils/api/forum';
import { getAllFiles } from '../../utils/api/file';
import { CourseContext } from '../../utils/contexts';

import globalStyles from '../../index.module.css';
import FormFooter from '../../components/FormFooter/FormFooter';
import CategorySelector from './CategorySelector';

export default function ForumPostEditor() {
  const { courseId, postId } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [shouldNotifyStudents, setShouldNotifyStudents] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCancel = () => {
    navigate(`/${courseId}/forum`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      title.match(/^\s*$/) ||
      content
        .replace(/<(.|\n)*?>/g, '')
        .trim()
        .match(/^\s*$/)
    ) {
      setErrorMessage('Do not leave fields empty');
      return;
    }
    setErrorMessage('');
    createOrUpdatePost(
      parseInt(courseId, 10),
      postId,
      title,
      categoryId,
      content,
      files,
      shouldNotifyStudents,
      navigate
    )
      .then((data) => {
        navigate(`/${courseId}/post/${postId || data.postId}`);
      })
      .catch((err) => {
        setErrorMessage(err.message);
        console.error(err.message);
      });
  };

  useEffect(() => {
    getCategories(courseId, navigate).then(setCategories);
    if (postId) {
      getPost(postId, navigate).then((data) => {
        setTitle(data.title);
        setCategoryId(data.categoryId);
        setContent(data.text);
        getAllFiles(data.files, navigate)
          .then(setFiles)
          .catch((err) => console.error(err.message));
      });
    }
  }, [courseId, postId, navigate]);

  return (
    <form className={globalStyles.pageContainer} onSubmit={handleSubmit}>
      <TitleInput label="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <CategorySelector
        isTeacher={isTeacher}
        categories={categories}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
      />
      <RichTextInput value={content} label="Post" id="post" onChange={setContent} />
      <AttachFilesInput files={files} setFiles={setFiles} />
      {isTeacher && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={shouldNotifyStudents}
                onChange={() => setShouldNotifyStudents((prev) => !prev)}
              />
            }
            label="Notify Students"
          />
        </FormGroup>
      )}
      <FormFooter errorMessage={errorMessage} onCancel={handleCancel} />
    </form>
  );
}
