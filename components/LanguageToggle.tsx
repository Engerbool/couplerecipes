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
      className="flex items-center justify-center gap-1 px-2 py-1.5 hover:bg-stone-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
      title={i18n.language === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      <Languages size={16} className="text-stone-600 dark:text-dark-text-secondary" />
      <span className="text-xs font-medium text-stone-600 dark:text-dark-text-secondary">
        {i18n.language === 'ko' ? 'KO' : 'EN'}
      </span>
    </button>
  );
};
