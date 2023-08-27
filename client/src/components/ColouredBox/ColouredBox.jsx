import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import styles from './ColouredBox.module.css';

const ColouredBox = React.forwardRef(function ColouredBox(
  {
    width = 'fit',
    height = 'fit-content',
    marginTopBottom = '50px',
    marginSide = '50px',
    paddingTopBottom = '40px',
    paddingSide = '40px',
    color = 'primary',
    children,
    onClick,
    ...rest
  },
  ref
) {
  const theme = useTheme();
  return (
    <Box
      className={styles.outlinedBox}
      sx={{
        width,
        height,
        borderColor: theme.palette.custom.outline,
        background: theme.palette.custom.background,
        margin: `${marginTopBottom} ${marginSide}`,
        ...rest,
      }}
      onClick={onClick}
    >
      <Box
        className={styles.bar}
        sx={{
          width: 'calc(100% + 2px)',
          marginLeft: '-1px',
          marginTop: '-1px',
          backgroundColor: theme.palette.custom[color] || theme.palette.custom.neutralBackground,
          borderColor: 'rgb(0, 0, 0, 0.25)',
        }}
      />
      <div
        className={styles.contentContainer}
        style={{
          padding: `${paddingTopBottom} ${paddingSide}`,
        }}
      >
        {children}
      </div>
    </Box>
  );
});

export default ColouredBox;
