import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { leavePartnership } from '../services/partnershipService';

interface Props {
  userId: string;
  partnershipId: string;
  partnerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const DisconnectModal: React.FC<Props> = ({
  userId,
  partnershipId,
  partnerName,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError('');
      await leavePartnership(userId, partnershipId);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Disconnect failed:', err);
      setError(err.message || t('partner.disconnectFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            {t('partner.disconnectPartner')}
          </h2>

          <p className="text-stone-600 mb-4">
            {t('partner.disconnectConfirm')}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-amber-800">
              <strong>{t('nav.connectedWith', { name: partnerName })}</strong>
            </p>
            <p className="text-xs text-amber-700 mt-2">
              {t('partner.disconnectWarning')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
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
              onClick={handleDisconnect}
              disabled={loading}
              className="flex-1 justify-center bg-red-600 hover:bg-red-700"
            >
              {loading ? t('partner.disconnecting') : t('partner.disconnect')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
