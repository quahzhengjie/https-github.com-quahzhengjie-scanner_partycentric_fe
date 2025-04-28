import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4682B4',
    },
    secondary: {
      main: '#FEBD2F',
    },
    success: {
      main: '#08C400',
    },
    warning: {
      main: '#EF0000',
    },
    background: {
      default: '#002850',
      paper: '#1F3A5E',
    },
    text: {
      primary: '#FFFAFA',
      secondary: '#F4F4F4',
    },
    info: {
      main: '#FFFAFA',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#FFFAFA',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#FFFAFA',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#FFFAFA',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'none',
        },
        contained: {
          backgroundColor: '#4682B4',
          color: '#FFFAFA',
          '&:hover': {
            backgroundColor: '#7383B0',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#1F3A5E',
        },
      },
    },
  },
});

export default darkTheme;