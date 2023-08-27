import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ColouredBox from '../../components/ColouredBox/ColouredBox';
import RichTextBox from '../../components/RichTextBox/RichTextBox';
import DownloadableFileListBox from '../../components/DownloadableFileListBox/DownloadableFileListBox';
import EditButtons from '../../components/EditButtons';
import { toDateString, toTimeString } from '../../utils/helpers';
import { deleteMaterial, getMaterial } from '../../utils/api/materials';
import { CourseContext } from '../../utils/contexts';

import styles from './TeachingMaterial.module.css';
import globalStyles from '../../index.module.css';

export default function TeachingMaterial() {
  const navigate = useNavigate();
  const { courseId, materialId } = useParams();
  const { role } = useContext(CourseContext);
  const isTeacher = useMemo(() => role === 'Creator' || role === 'Educator', [role]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [date, setDate] = useState(new Date());

  const handleEdit = () => {
    navigate(`/${courseId}/materials/edit/${materialId}`);
  };

  useEffect(() => {
    getMaterial(materialId, navigate)
      .then((data) => {
        setTitle(data.materialName);
        setDescription(data.description);
        setDate(new Date(data.timeCreated));
        setFiles(
          data.files.map((file) => ({
            key: file.fileId,
            ...file,
          }))
        );
      })
      .catch((err) => console.error(err.message));
  }, [materialId, navigate]);

  const handleDelete = () => {
    deleteMaterial(materialId, navigate)
      .then(() => navigate(`/${courseId}/materials`))
      .catch((err) => console.error(err.message));
  };

  return (
    <div className={globalStyles.pageContainer}>
      <section className={styles.pseudoHeader}>
        <div className={styles.titleInfo}>
          <h2 className={styles.materialTitle}>{title}</h2>
        </div>
        {isTeacher && (
          <EditButtons
            helperText={`material ${title}`}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )}
      </section>
      <h4 className={styles.postTime}>
        Posted {toDateString(date)} at {toTimeString(date)}
      </h4>
      <div className={styles.boxContainer}>
        <ColouredBox
          color="light"
          marginSide="0px"
          marginTopBottom="20px"
          paddingSide="1rem"
          paddingTopBottom="0"
          flexGrow="1"
        >
          <RichTextBox content={description} />
        </ColouredBox>
        {files.length > 0 && <DownloadableFileListBox files={files} />}
      </div>
    </div>
  );
}
