import React from 'react';
import { AdminAccountManagement } from './AdminAccountManagement';
import { ProducerListingChangeModeration } from './ProducerListingChangeModeration';
import { ProducerMediaModeration } from './ProducerMediaModeration';
import { ProducerOwnershipAdmin as ProducerOwnershipManagement } from './ProducerOwnershipManagement';

interface ProducerOwnershipAdminProps {
  enabled: boolean;
  onChanged?: () => void;
}

/**
 * Keeps trusted producer-content moderation, ownership and account/dispute
 * controls together in the existing Administration flow without granting
 * admins producer identity or access to private traveler content.
 */
export const ProducerOwnershipAdmin: React.FC<ProducerOwnershipAdminProps> = ({
  enabled,
  onChanged,
}) => (
  <div className="space-y-6">
    <ProducerMediaModeration enabled={enabled} onChanged={onChanged} />
    <ProducerListingChangeModeration enabled={enabled} onChanged={onChanged} />
    {enabled && <AdminAccountManagement />}
    <ProducerOwnershipManagement enabled={enabled} onChanged={onChanged} />
  </div>
);
