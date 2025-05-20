import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // Default to dark theme

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      // Check if user previously set a preference
      const storedTheme = localStorage.getItem('theme');
      
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        // Default to dark theme
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
      }
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Save preference to localStorage
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 