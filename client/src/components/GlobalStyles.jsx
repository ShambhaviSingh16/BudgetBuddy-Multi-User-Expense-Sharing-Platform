// src/components/GlobalStyles.jsx
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const GlobalStyles = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      document.documentElement.style.setProperty('--card-bg', '#1f2937');
      document.documentElement.style.setProperty('--text-primary', '#f3f4f6');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--primary-gradient', 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)');
      document.documentElement.style.setProperty('--card-bg', '#ffffff');
      document.documentElement.style.setProperty('--text-primary', '#1f2937');
    }
  }, [darkMode]);

  return null;
};

export default GlobalStyles;