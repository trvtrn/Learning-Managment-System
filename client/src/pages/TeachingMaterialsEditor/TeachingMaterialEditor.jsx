import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

import TitleInput from '../../components/TitleInput';
import RichTextInput from '../../components/RichTextInput';
import AttachFilesInput from '../../components/AttachFilesInput/AttachFilesInput';
import { isBlank } from '../../utils/helpers';
import { createOrUpdateMaterial, getMaterial } from '../../utils/api/materials';
import { getAllFiles } from '../../utils/api/file';

import styles from './TeachingMaterialEditor.module.css';
import FormFooter from '../../components/FormFooter/FormFooter';

export default function TeachingMaterialEdit() {
  const { materialId, courseId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [shouldNotifyStudents, setShouldNotifyStudents] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!materialId) {
      return;
    }
    getMaterial(materialId, navigate)
      .then((data) => {
        setTitle(data.materialName);
        setDescription(data.description);
        return data.files;
      })
      .then((existingFiles) => getAllFiles(existingFiles, navigate))
      .then(setFiles)
      .catch((err) => setErrorMessage(errorMessage));
  }, [materialId, errorMessage, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.match(/^\s*$/) || isBlank(description)) {
      setErrorMessage('Do not leave fields blank');
      return;
    }
    createOrUpdateMaterial(
      materialId,
      courseId,
      title,
      description,
      files,
      shouldNotifyStudents,
      navigate
    )
      .then((data) => {
        navigate(`/${courseId}/materials/${data.materialId || materialId}`);
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  const handleCancel = () => {
    if (!materialId) {
      navigate(`/${courseId}/materials`);
    } else {
      navigate(`/${courseId}/materials/${materialId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editContainer}>
      <TitleInput label="Material Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <RichTextInput value={description} onChange={setDescription} />
      <AttachFilesInput files={files} setFiles={setFiles} />
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
      <FormFooter errorMessage={errorMessage} onCancel={handleCancel} />
    </form>
  );
}
