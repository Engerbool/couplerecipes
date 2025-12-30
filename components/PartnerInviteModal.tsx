import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check, UserPlus } from 'lucide-react';
import { Button } from './Button';
import { createPartnership, joinPartnership } from '../services/partnershipService';

interface Props {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PartnerInviteModal: React.FC<Props> = ({ userId, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [inviteCode, setInviteCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateInvite = async () => {
    try {
      setLoading(true);
      setError('');
      const code = await createPartnership(userId);
      setInviteCode(code);
      setMode('create');
    } catch (err: any) {
      console.error('Partnership creation failed:', err);
      setError(err.message || t('partner.createCodeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    try {
      setLoading(true);
      setError('');
      await joinPartnership(userId, inputCode.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t('partner.joinFailed'));
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

        {mode === 'choice' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">{t('partner.connectWithPartner')}</h2>
            <p className="text-stone-500 mb-8">{t('partner.shareRecipes')}</p>

            <div className="space-y-3">
              <Button
                onClick={handleCreateInvite}
                disabled={loading}
                className="w-full py-3 justify-center"
              >
                {t('partner.createInviteCode')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setMode('join')}
                className="w-full py-3 justify-center"
              >
                {t('partner.iHaveCode')}
              </Button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {mode === 'create' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t('partner.yourInviteCode')}</h2>
            <p className="text-stone-500 mb-6">{t('partner.shareThisCode')}</p>

            <div className="bg-stone-50 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-amber-600 tracking-widest mb-4">
                {inviteCode}
              </div>
              <Button
                variant="secondary"
                onClick={handleCopy}
                className="w-full justify-center"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" /> {t('partner.copied')}
                  </>
                ) : (
                  <>
                    <Copy size={16} /> {t('partner.copyCode')}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-stone-400">
              {t('partner.codeExpires')}
            </p>
          </div>
        )}

        {mode === 'join' && (
          <div>
            <h2 className="text-2xl font-bold text-stone-800 mb-4">{t('partner.enterInviteCode')}</h2>
            <p className="text-stone-500 mb-6">
              {t('partner.askForCode')}
            </p>

            <input
              type="text"
              value={inputCode}
              onChange={(e) =>
                setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 outline-none mb-4"
              maxLength={6}
              autoFocus
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setMode('choice')}
                className="flex-1 justify-center"
              >
                {t('partner.back')}
              </Button>
              <Button
                onClick={handleJoin}
                disabled={inputCode.length !== 6 || loading}
                className="flex-1 justify-center"
              >
                {loading ? t('partner.connecting') : t('partner.connect')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
