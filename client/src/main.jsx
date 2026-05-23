import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Chakra UI imports with custom theme
import { ChakraProvider } from '@chakra-ui/react';

// Your custom providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  </React.StrictMode>
);