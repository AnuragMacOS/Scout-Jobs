import React, { createContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  isDark: false,
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

function applyTheme(dark) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('light', !dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  try {
    localStorage.setItem('scout-theme', dark ? 'dark' : 'light');
  } catch {}
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    const saved = localStorage.getItem('scout-theme') || localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;

    const handleSystemChange = (e) => {
      try {
        if (localStorage.getItem('scout-theme') || localStorage.getItem('theme')) return;
      } catch {}
      setIsDark(e.matches);
    };

    mq.addEventListener('change', handleSystemChange);
    return () => mq.removeEventListener('change', handleSystemChange);
  }, []);

  const setTheme = useCallback((mode) => {
    setIsDark(mode === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        theme: isDark ? 'dark' : 'light',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
export { useTheme } from '../hooks/useTheme';
