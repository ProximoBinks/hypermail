import { useTheme } from '../lib/ThemeContext';
import { useState, useEffect } from 'react';

export default function Header({ title }) {
  const { theme, toggleTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/logo-light.png'); // Default fallback

  // Update logo source when theme changes
  useEffect(() => {
    setLogoSrc(theme === 'dark' ? '/logo-dark.png' : '/logo-light.png');
  }, [theme]);

  return (
    <header className="fixed top-0 left-0 w-full p-4 z-50 shadow-md text-white bg-black">
      {/* If you want true full-width edge-to-edge, remove 'max-w-7xl mx-auto' */}
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img 
            src={logoSrc}
            alt="HyperMail Logo" 
            className="h-8 w-auto mt-1"
          />
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-800'}`}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            // Sun icon for dark mode (to switch to light)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            // Moon icon for light mode (to switch to dark)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}