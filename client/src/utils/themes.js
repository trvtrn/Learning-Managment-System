import { createTheme } from '@mui/material';

const palette = {
  primary: {
    main: '#2e005f',
    active: '#6224a3',
  },
  secondary: {
    main: '#81d2c7',
    active: '#72b8ae',
    contrastText: '#ffffff',
  },
  normal: {
    main: '#e0d3ee',
    active: '#6224a3',
    contrastText: '#000000',
  },
  info: {
    main: '#ffee93',
    active: '#fff1a6',
    contrastText: '#000000',
  },
  custom: {
    primary: '#2e005f',
    light: '#e0d3ee',
    info: '#ffee93',
    purple: '#e0d3ee',
    pink: '#ffccd5',
    green: '#b7ebb7',
    blue: '#81d2c7',
    yellow: '#ffee93',
    red: '#ffafab',
    paleBlue: '#eae8ff',
    neutralBackground: '#f4f4f4',
    background: '#ffffff',
    defaultFont: '#000000',
    outline: '#a6a6a6',
    heading: '#37342f',
  },
};

const MuiButton = {
  styleOverrides: {
    root: ({ ownerState, theme }) => ({
      minWidth: '200px',
      borderWidth: '3px',
      borderRadius: '50px',
      border: ownerState.variant === 'contained' && '3px solid',
      padding: '16px 40px 13px 40px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fontSize: '1rem',
      textTransform: 'none',
      borderColor: theme.palette[ownerState.color].main,
      boxShadow: 'none',
      '&:hover': {
        borderWidth: '3px',
        backgroundColor:
          ownerState.variant === 'contained'
            ? theme.palette[ownerState.color].active
            : theme.palette.custom.neutralBackground,
        borderColor: theme.palette[ownerState.color].main,
        boxShadow: 'none',
      },
    }),
  },
};

const MuiTextField = {
  defaultProps: {
    autoComplete: 'off',
  },
};

const MuiButtonBase = {
  boxSizing: 'border-box',
  defaultProps: {
    disableRipple: true,
  },
};

const theme = createTheme({ palette, components: { MuiButton, MuiButtonBase, MuiTextField } });

export default theme;
