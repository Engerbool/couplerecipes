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
        setPartnerName(partner.displayName || partner.email);
      }
    };
    fetchPartner();
  }, [partnerId]);

  if (!partnerName) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
      <Users size={14} />
      <span>{t('nav.connectedWith', { name: partnerName })}</span>
    </div>
  );
};
