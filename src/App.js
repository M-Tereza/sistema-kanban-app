import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/navbar';
import Rotas from './rotas';

const theme = createTheme({
  palette: {
    primary: { main: '#4caf50' },
    secondary: { main: '#ff9800' },
  },
  typography: {
    fontFamily: 'Roboto, Arial',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <div className="container" style={{ marginTop: '80px' }}>
        <Rotas />
      </div>
    </ThemeProvider>
  );
}

export default App;