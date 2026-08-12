import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check local storage for saved theme
    return localStorage.getItem('app_theme') || 'default';
  });

  useEffect(() => {
    // Remove all old theme classes
    document.documentElement.classList.remove('theme-red', 'theme-emerald', 'theme-purple', 'theme-gold');
    
    // Add new theme class if not default
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    // Save to local storage
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const themes = [
    { id: 'default', name: 'Ocean Blue', color: '#2563eb' },
    { id: 'red', name: 'Ruby Red', color: '#dc2626' },
    { id: 'emerald', name: 'Emerald Green', color: '#059669' },
    { id: 'purple', name: 'Royal Purple', color: '#7c3aed' },
    { id: 'gold', name: 'Amber Gold', color: '#d97706' },
  ];

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
