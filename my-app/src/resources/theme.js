import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: [
            '"Source Sans 3"',
            'Roboto', // Your custom font here
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(',')
    },
    palette: {
        primary: {
            main: '#1976d2', // Change to your primary color
        },
        secondary: {
            main: '#dc004e', // Change to your secondary color
        },
    },
});

export default theme;