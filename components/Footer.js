import { useTheme } from '../lib/ThemeContext';
import { useState, useEffect } from 'react';

export default function Footer() {
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/logo-light.png'); // Default fallback
  
  // Update logo source when theme changes
  useEffect(() => {
    setLogoSrc(theme === 'dark' ? '/logo-dark.png' : '/logo-light.png');
  }, [theme]);
  
  return (
    <footer className="text-white p-4 w-full bg-black">
      <div className="max-w-7xl mx-auto flex justify-center items-center">
        <img 
          src={logoSrc}
          alt="HyperStake Logo" 
          className="h-12 m-1" 
        />
      </div>
    </footer>
  )
}
