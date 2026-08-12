import React, { createContext, useState, useContext, useEffect } from 'react';
import { subscribeToAppSettings } from '../services/firebaseService';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // Sync theme with Firebase global appSettings
  useEffect(() => {
    const unsubscribe = subscribeToAppSettings((settings) => {
      if (settings && settings.theme) {
        setTheme(settings.theme);
      } else {
        setTheme('default');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply theme class to the document body/html dynamically
  useEffect(() => {
    if (isLoading) return; // Wait for initial fetch
    
    // Remove all old theme classes
    document.documentElement.classList.remove('theme-red', 'theme-emerald', 'theme-purple', 'theme-gold');
    
    // Add new theme class if not default
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme, isLoading]);

  const themes = [
    { id: 'default', name: 'Ocean Blue', color: '#2563eb' },
    { id: 'red', name: 'Ruby Red', color: '#dc2626' },
    { id: 'emerald', name: 'Emerald Green', color: '#059669' },
    { id: 'purple', name: 'Royal Purple', color: '#7c3aed' },
    { id: 'gold', name: 'Amber Gold', color: '#d97706' },
  ];

  return (
    <ThemeContext.Provider value={{ theme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
