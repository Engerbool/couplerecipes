import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { getPartner } from '../services/partnershipService';

interface Props {
  partnerId: string;
}

export const PartnerBadge: React.FC<Props> = ({ partnerId }) => {
  const { t } = useTranslation();
  const [partnerName, setPartnerName] = useState('');

  useEffect(() => {
    const fetchPartner = async () => {
      const partner = await getPartner(partnerId);
      if (partner) {
        setPartnerName(partner.nickname || partner.displayName || partner.email);
      }
    };
    fetchPartner();
  }, [partnerId]);

  if (!partnerName) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm border border-emerald-200 dark:border-emerald-800">
      <Users size={14} />
      <span>{t('nav.connectedWith', { name: partnerName })}</span>
    </div>
  );
};
