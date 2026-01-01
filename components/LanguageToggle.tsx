import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ko' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center w-8 h-8 text-2xl hover:scale-110 transition-transform rounded-lg hover:bg-stone-50 dark:hover:bg-dark-bg-tertiary"
      title={i18n.language === 'ko' ? 'Switch to English' : '한국어로 전환'}
    >
      {i18n.language === 'ko' ? '🇰🇷' : '🇺🇸'}
    </button>
  );
};
