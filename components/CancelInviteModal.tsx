import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { leavePartnership } from '../services/partnershipService';

interface Props {
  userId: string;
  partnershipId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelInviteModal: React.FC<Props> = ({
  userId,
  partnershipId,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancelInvite = async () => {
    // 동시 실행 방지
    if (loading) {
      console.warn('[DEBUG] Cancel already in progress, ignoring duplicate call');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('[DEBUG] Starting cancel invite for userId:', userId, 'partnershipId:', partnershipId);
      await leavePartnership(userId, partnershipId);
      console.log('[DEBUG] Cancel invite completed successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Cancel invite failed:', err);
      setError(err.message || t('partner.createCodeFailed'));
    } finally {
      setLoading(false);
    }
  };

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
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-amber-600 dark:text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-stone-800 dark:text-dark-text-primary mb-2">
            {t('partner.cancelInviteTitle')}
          </h2>

          <p className="text-stone-600 dark:text-dark-text-secondary mb-4">
            {t('partner.cancelInviteConfirm')}
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              {t('partner.cancelInviteWarning')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1 justify-center"
            >
              {t('partner.back')}
            </Button>
            <Button
              onClick={handleCancelInvite}
              disabled={loading}
              className="flex-1 justify-center bg-amber-600 hover:bg-amber-700"
            >
              {loading ? t('partner.canceling') : t('partner.cancelInvite')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
