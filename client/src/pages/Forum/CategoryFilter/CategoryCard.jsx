import React from 'react';
import { Card, useTheme } from '@mui/material';
import styles from './CategoryFilter.module.css';

export default function CategoryCard({
  categoryId,
  categoryName,
  categoryColor,
  isActive,
  toggleActiveCategory,
}) {
  const theme = useTheme();
  return (
    <Card
      className={`${styles.categoryButton} ${isActive && styles.categoryButtonActive}`}
      onClick={() => {
        toggleActiveCategory(categoryId);
      }}
      sx={{
        backgroundColor: theme.palette.custom[categoryColor],
        fontSize: '0.85rem',
        borderRadius: '10px',
        padding: '0.5rem 1.2rem',
        minWidth: 'fit-content',
        transition: 'filter 0.5s, transform 0.5s',
        color: theme.palette.custom.defaultFont,
        boxSizing: 'border-box',
        border: isActive
          ? `3px solid ${theme.palette.custom.defaultFont}`
          : `3px solid ${theme.palette.custom.background}`,
        boxShadow: 'none',
      }}
    >
      {categoryName}
    </Card>
  );
}
