import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserX } from 'lucide-react';
import { getPartner } from '../services/partnershipService';
import { Button } from './Button';

interface Props {
  partnerId: string;
  onDisconnect: () => void;
}

export const PartnerBadge: React.FC<Props> = ({ partnerId, onDisconnect }) => {
  const { t } = useTranslation();
  const [partnerName, setPartnerName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      const partner = await getPartner(partnerId);
      if (partner) {
        setPartnerName(partner.nickname || partner.displayName || partner.email);
      }
    };
    fetchPartner();
  }, [partnerId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  if (!partnerName) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
        title={t('partner.clickForOptions')}
      >
        <Users size={14} />
        <span className="hidden sm:inline">{t('nav.connectedWith', { name: partnerName })}</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-xl border border-stone-200 dark:border-dark-border-primary p-2 min-w-[200px] z-50">
          <div className="px-3 py-2 text-sm text-stone-600 dark:text-dark-text-secondary border-b border-stone-200 dark:border-dark-border-primary mb-2">
            {t('nav.connectedWith', { name: partnerName })}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setShowDropdown(false);
              onDisconnect();
            }}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20"
          >
            <UserX size={16} />
            {t('partner.disconnect')}
          </Button>
        </div>
      )}
    </div>
  );
};
