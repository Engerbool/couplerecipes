import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ko' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-dark-text-secondary hover:text-amber-600 dark:hover:text-amber-500 transition-colors rounded-lg hover:bg-stone-50 dark:hover:bg-dark-bg-tertiary"
      title="Change Language"
    >
      <Languages size={16} />
      <span className="font-bold">{i18n.language.toUpperCase()}</span>
    </button>
  );
};
