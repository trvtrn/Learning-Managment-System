import React from 'react';
import { Radio, RadioGroup } from '@mui/material';
import CategoryCard from '../Forum/CategoryFilter/CategoryCard';
import EditorFormInputBase from '../../components/EditorFormInputBase';

function CategorySelector({ isTeacher, categories, categoryId, setCategoryId }) {
  return (
    <EditorFormInputBase label="Select Category" htmlFor="select-category">
      <RadioGroup id="select-category" row>
        {categories.map(
          (categoryInfo) =>
            (isTeacher || categoryInfo.selectableForStudents) && (
              <Radio
                key={categoryInfo.categoryId}
                icon={<CategoryCard {...categoryInfo} />}
                checkedIcon={<CategoryCard {...categoryInfo} isActive />}
                value={categoryInfo.categoryName}
                checked={categoryId === categoryInfo.categoryId}
                onClick={(e) => {
                  if (categoryId === categoryInfo.categoryId) {
                    setCategoryId(null);
                  } else {
                    setCategoryId(categoryInfo.categoryId);
                  }
                }}
                sx={{
                  padding: 0,
                  marginRight: '0.5rem',
                }}
              />
            )
        )}
      </RadioGroup>
    </EditorFormInputBase>
  );
}

export default CategorySelector;
