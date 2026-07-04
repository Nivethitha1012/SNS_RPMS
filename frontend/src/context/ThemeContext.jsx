/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('color-scheme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', theme);
    }
    localStorage.setItem('color-scheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    // Suppress all transitions while the theme class flips
    root.classList.add('theme-switching');
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    // Two rAFs: first waits for React to commit the state,
    // second waits for the browser to paint before re-enabling transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('theme-switching');
      });
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
