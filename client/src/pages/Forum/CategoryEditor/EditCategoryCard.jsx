import React from 'react';
import { Card, Divider, IconButton, OutlinedInput, selectClasses, useTheme } from '@mui/material';
import {
  DeleteOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  ColorLensOutlined,
} from '@mui/icons-material';
import styles from './CategoryEditor.module.css';
import ColorSelect from './ColorSelect';

export default function EditCategoryCard({
  index,
  categoryId,
  categoryName,
  categoryColor,
  selectableForStudents,
  handleChange,
  handleDelete,
}) {
  const theme = useTheme();
  return (
    <Card
      className={styles.categoryCard}
      sx={{
        backgroundColor: theme.palette.custom[categoryColor],
        boxShadow: 'none',
        padding: '0.3rem 0.3rem 0.3rem 1rem',
        width: 'calc(50% - 0.5rem)',
        borderRadius: '10px',
      }}
    >
      <div className={styles.cardInputContainer}>
        <OutlinedInput
          className={styles.categoryCardName}
          value={categoryName}
          onChange={(e) =>
            handleChange(index, categoryId, e.target.value, categoryColor, selectableForStudents)
          }
          sx={{
            fontSize: '0.85rem',
            fontWeight: 'bold',
            width: '80%',
            height: '2.1rem',
          }}
        />
        <ColorSelect
          color={categoryColor}
          onChange={(e) =>
            handleChange(index, categoryId, categoryName, e.target.value, selectableForStudents)
          }
          sx={{
            width: '20%',
            height: '2.1rem',
            [`& .${selectClasses.iconOpen}`]: {
              transform: 'none',
            },
          }}
          IconComponent={ColorLensOutlined}
        />
      </div>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ backgroundColor: theme.palette.custom.defaultFont, opacity: 0.4 }}
      />
      <IconButton
        aria-label="set student visibility"
        size="small"
        onClick={(e) =>
          handleChange(index, categoryId, categoryName, categoryColor, !selectableForStudents)
        }
      >
        {selectableForStudents ? (
          <VisibilityOutlined sx={{ color: theme.palette.custom.defaultFont }} />
        ) : (
          <VisibilityOffOutlined sx={{ color: theme.palette.custom.defaultFont }} />
        )}
      </IconButton>
      <IconButton size="small" onClick={handleDelete}>
        <DeleteOutlined sx={{ color: theme.palette.custom.defaultFont }} />
      </IconButton>
    </Card>
  );
}
