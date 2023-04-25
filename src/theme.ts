import { Montserrat, Poppins } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

export const montserrat = Montserrat({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

export const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#fc2d42',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: `#7a0d17`,
    },
  },
  typography: {
    fontFamily: poppins.style.fontFamily,
  },
});

export default theme;
