import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, LogOut } from 'lucide-react';
import { Button } from './Button';

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<Props> = ({ onClose, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 dark:text-dark-text-tertiary hover:text-stone-600 dark:hover:text-dark-text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut size={32} className="text-amber-600 dark:text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-stone-800 dark:text-dark-text-primary mb-2">
            {t('auth.logoutConfirm')}
          </h2>

          <p className="text-stone-600 dark:text-dark-text-secondary mb-6">
            {t('auth.logoutMessage')}
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 justify-center"
            >
              {t('partner.back')}
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 justify-center"
            >
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
