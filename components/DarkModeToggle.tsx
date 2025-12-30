import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-dark-text-secondary hover:text-amber-600 dark:hover:text-amber-500 transition-colors rounded-lg hover:bg-stone-50 dark:hover:bg-dark-bg-tertiary"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <>
          <Sun size={16} className="text-amber-500" />
          <span className="font-bold hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon size={16} className="text-stone-600 dark:text-dark-text-secondary" />
          <span className="font-bold hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
};
