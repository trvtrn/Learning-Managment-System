import React from 'react';
import { EditOutlined } from '@mui/icons-material';
import { Checkbox, IconButton, useTheme } from '@mui/material';
import CategoryCard from './CategoryCard';

import styles from './CategoryFilter.module.css';

export default function CategoryFilter({
  categories,
  setActiveCategories,
  setShowModal,
  isTeacher,
}) {
  const theme = useTheme();
  const toggleActiveCategory = (tagId) => {
    setActiveCategories((prev) => {
      const newTags = new Set(prev);
      if (prev.has(tagId)) {
        newTags.delete(tagId);
      } else {
        newTags.add(tagId);
      }
      return newTags;
    });
  };

  return (
    <div className={styles.categoriesFilterContainer}>
      <span className={styles.filterLabel}>Filter by: </span>
      <div className={styles.categoriesContainer}>
        {categories.map((category) => (
          <Checkbox
            key={category.categoryId}
            onChange={() => {
              toggleActiveCategory(category.categoryId);
            }}
            sx={{
              padding: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
            checkedIcon={
              <CategoryCard {...category} toggleActiveCategory={toggleActiveCategory} isActive />
            }
            icon={<CategoryCard {...category} toggleActiveCategory={toggleActiveCategory} />}
          />
        ))}
        {isTeacher && (
          <IconButton
            className={styles.categoryButton}
            size="small"
            sx={{
              backgroundColor: theme.palette.custom.light,
              borderRadius: '10px',
              transition: 'filter 0.5s',
              '&:hover': {
                backgroundColor: theme.palette.custom.light,
              },
            }}
            onClick={() => setShowModal(true)}
          >
            <EditOutlined sx={{ color: theme.palette.custom.defaultFont }} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
