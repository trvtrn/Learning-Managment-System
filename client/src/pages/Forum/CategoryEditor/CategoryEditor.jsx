import React, { useState } from 'react';
import {
  Alert,
  Button,
  FormControl,
  FormLabel,
  Modal,
  OutlinedInput,
  useTheme,
} from '@mui/material';

import ColouredBox from '../../../components/ColouredBox/ColouredBox';
import EditCategoryCard from './EditCategoryCard';
import ColorSelect from './ColorSelect';

import styles from './CategoryEditor.module.css';

export default function CategoryEditor({ categories, showModal, setShowModal, handleSubmit }) {
  const theme = useTheme();
  const [newCategories, setNewCategories] = useState(categories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('pink');
  const [errorMessage, setErrorMessage] = useState('');
  const handleAdd = (e) => {
    e.preventDefault();
    if (newCategoryName.match(/^\s*$/)) {
      setErrorMessage('Please fill in a category name');
      return;
    }

    setErrorMessage('');
    setNewCategories((prev) => [
      ...prev,
      {
        categoryName: newCategoryName.trim(),
        categoryColor: newCategoryColor,
        selectableForStudents: false,
      },
    ]);
    setNewCategoryName('');
    setNewCategoryColor('pink');
  };

  const handleChange = (index, categoryId, categoryName, categoryColor, selectableForStudents) => {
    setNewCategories((prev) => {
      const updatedCategories = [...prev];
      updatedCategories.splice(index, 1, {
        categoryId,
        categoryName,
        categoryColor,
        selectableForStudents,
      });
      return updatedCategories;
    });
  };

  const handleDelete = (index) => {
    setNewCategories((prev) => {
      const updatedCategories = [...prev];
      updatedCategories.splice(index, 1);
      return updatedCategories;
    });
  };

  return (
    <Modal className={styles.modal} open={showModal} onClose={() => setShowModal(false)}>
      <ColouredBox margin="0" width="800px" paddingSide="2rem">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(newCategories, setErrorMessage);
          }}
        >
          <h3 className={styles.modalHeading}>Edit Categories</h3>
          <div className={styles.categoryCardContainer}>
            {newCategories.map((category, idx) => (
              <EditCategoryCard
                key={idx}
                index={idx}
                {...category}
                handleChange={handleChange}
                handleDelete={handleDelete}
              />
            ))}
          </div>
          <div
            className={styles.addFormContainer}
            style={{ backgroundColor: theme.palette.custom.light }}
          >
            <FormControl>
              <FormLabel
                className={styles.formLabel}
                sx={{ fontWeight: 'bold', color: theme.palette.custom.defaultFont }}
                htmlFor="category-name"
              >
                Category Name
              </FormLabel>
              <OutlinedInput
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                sx={{
                  backgroundColor: theme.palette.custom.background,
                  marginRight: '-1px',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              />
            </FormControl>
            <FormControl sx={{ marginRight: '1rem' }}>
              <FormLabel
                className={styles.formLabel}
                htmlFor="color"
                sx={{ fontWeight: 'bold', color: theme.palette.custom.defaultFont }}
              >
                Color
              </FormLabel>
              <ColorSelect
                color={newCategoryColor}
                sx={{
                  backgroundColor: theme.palette.custom.background,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
                inputProps={{ sx: { paddingLeft: '0 !important', paddingRight: '0 !important' } }}
                IconComponent={() => null}
                onChange={(e) => setNewCategoryColor(e.target.value)}
              />
            </FormControl>
            <Button
              onClick={handleAdd}
              variant="contained"
              color="primary"
              sx={{ height: '3.2rem', minWidth: 'fit-content', fontSize: '1rem' }}
            >
              Add
            </Button>
          </div>
          {errorMessage && (
            <Alert severity="error" sx={{ marginBottom: '1rem' }}>
              {errorMessage}
            </Alert>
          )}
          <div className={styles.formButtonContainer}>
            <Button variant="outlined" color="primary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
          </div>
        </form>
      </ColouredBox>
    </Modal>
  );
}
