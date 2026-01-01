import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { User as UserIcon, Upload, X } from 'lucide-react';

interface ProfileSetupModalProps {
  defaultName: string;
  defaultPhotoURL: string | null;
  onSave: (nickname: string, customPhotoURL: string | null) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

const AVATAR_OPTIONS = [
  '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🍳', '🥘', '🍜', '🍲', '🧁', '🍰',
  '🍕', '🍔', '🌮', '🍱', '🍛', '🥗', '🍝', '🥟', '🍣'
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  defaultName,
  defaultPhotoURL,
  onSave,
  onClose,
  isInitialSetup = true
}) => {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState(defaultName);
  const [error, setError] = useState('');
  const [photoType, setPhotoType] = useState<'google' | 'upload' | 'avatar'>('google');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
        setPhotoType('upload');
      };
      reader.readAsDataURL(file);
    }
  };

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

    let finalPhotoURL: string | null = null;

    if (photoType === 'google') {
      finalPhotoURL = null; // Use default Google photo
    } else if (photoType === 'upload' && uploadedPhoto) {
      finalPhotoURL = uploadedPhoto;
    } else if (photoType === 'avatar') {
      finalPhotoURL = `avatar:${selectedAvatar}`;
    }

    onSave(trimmed, finalPhotoURL);
  };

  const getCurrentPhotoDisplay = () => {
    if (photoType === 'upload' && uploadedPhoto) {
      return <img src={uploadedPhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover" />;
    } else if (photoType === 'avatar') {
      return <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-4xl">{selectedAvatar}</div>;
    } else if (defaultPhotoURL) {
      return <img src={defaultPhotoURL} alt="Profile" className="w-20 h-20 rounded-full object-cover" />;
    } else {
      return (
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <UserIcon size={40} className="text-amber-600 dark:text-amber-500" />
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {!isInitialSetup && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 dark:text-dark-text-tertiary hover:text-stone-600 dark:hover:text-dark-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        )}

        <div className="flex flex-col items-center mb-6">
          {getCurrentPhotoDisplay()}
          <h2 className="text-2xl font-bold text-stone-800 dark:text-dark-text-primary mb-2 mt-4">
            {isInitialSetup ? t('nickname.welcome') : t('profile.edit')}
          </h2>
          <p className="text-stone-500 dark:text-dark-text-secondary text-center text-sm">
            {t('nickname.setupMessage')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nickname Input */}
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

          {/* Photo Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-dark-text-secondary mb-2">
              {t('profile.photoLabel')}
            </label>

            {/* Photo Type Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPhotoType('google')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  photoType === 'google'
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 dark:bg-dark-bg-tertiary text-stone-600 dark:text-dark-text-secondary hover:bg-stone-200 dark:hover:bg-dark-bg-primary'
                }`}
              >
                {t('profile.googlePhoto')}
              </button>
              <button
                type="button"
                onClick={() => setPhotoType('upload')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  photoType === 'upload'
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 dark:bg-dark-bg-tertiary text-stone-600 dark:text-dark-text-secondary hover:bg-stone-200 dark:hover:bg-dark-bg-primary'
                }`}
              >
                {t('profile.uploadPhoto')}
              </button>
              <button
                type="button"
                onClick={() => setPhotoType('avatar')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  photoType === 'avatar'
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-100 dark:bg-dark-bg-tertiary text-stone-600 dark:text-dark-text-secondary hover:bg-stone-200 dark:hover:bg-dark-bg-primary'
                }`}
              >
                {t('profile.avatarPhoto')}
              </button>
            </div>

            {/* Upload Section */}
            {photoType === 'upload' && (
              <div className="border-2 border-dashed border-stone-300 dark:border-dark-border-primary rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-stone-600 dark:text-dark-text-secondary hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                >
                  <Upload size={32} />
                  <span className="text-sm font-medium">{t('profile.clickToUpload')}</span>
                </label>
              </div>
            )}

            {/* Avatar Selection */}
            {photoType === 'avatar' && (
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-full aspect-square rounded-lg text-2xl flex items-center justify-center transition-all ${
                      selectedAvatar === emoji
                        ? 'bg-amber-500 ring-2 ring-amber-500 ring-offset-2'
                        : 'bg-stone-100 dark:bg-dark-bg-tertiary hover:bg-stone-200 dark:hover:bg-dark-bg-primary'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {!isInitialSetup && onClose && (
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1 justify-center">
                {t('editor.cancel')}
              </Button>
            )}
            <Button type="submit" className={`${isInitialSetup ? 'w-full' : 'flex-1'} justify-center`}>
              {isInitialSetup ? t('nickname.save') : t('editor.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
