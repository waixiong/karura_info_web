import { createTheme } from '@material-ui/core/styles';

export const theme = createTheme({
  palette: {
    type: "dark",
    primary: {
      light: '#e40c5b',
      main: '#f53347',
      dark: '#f53347',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});