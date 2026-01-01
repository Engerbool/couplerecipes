import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { User as UserIcon } from 'lucide-react';

interface NicknameSetupModalProps {
  onSave: (nickname: string) => void;
}

export const NicknameSetupModal: React.FC<NicknameSetupModalProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError(t('nickname.tooShort'));
      return;
    }
    if (trimmed.length > 20) {
      setError(t('nickname.tooLong'));
      return;
    }

    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <UserIcon size={40} className="text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-dark-text-primary mb-2">
            {t('nickname.welcome')}
          </h2>
          <p className="text-stone-500 dark:text-dark-text-secondary text-center text-sm">
            {t('nickname.setupMessage')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-dark-text-secondary mb-2">
              {t('nickname.label')}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              placeholder={t('nickname.placeholder')}
              className="w-full px-4 py-3 border border-stone-300 dark:border-dark-border-primary rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600 focus:border-transparent outline-none transition-all bg-white dark:bg-dark-bg-tertiary text-stone-800 dark:text-dark-text-primary placeholder:text-stone-400 dark:placeholder:text-dark-text-tertiary"
              maxLength={20}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
            <p className="text-xs text-stone-400 dark:text-dark-text-tertiary mt-1">
              {t('nickname.hint')}
            </p>
          </div>

          <Button type="submit" className="w-full">
            {t('nickname.save')}
          </Button>
        </form>
      </div>
    </div>
  );
};
