import React from 'react';
import { AdminAccountManagement } from './AdminAccountManagement';
import { AdminReviewModeration } from './AdminReviewModeration';
import { ProducerListingChangeModeration } from './ProducerListingChangeModeration';
import { ProducerMediaModeration } from './ProducerMediaModeration';
import { ProducerOwnershipAdmin as ProducerOwnershipManagement } from './ProducerOwnershipManagement';

interface ProducerOwnershipAdminProps {
  enabled: boolean;
  onChanged?: () => void;
}

/**
 * Keeps trusted producer-content moderation, community review moderation,
 * ownership and account/dispute controls together in the existing Administration
 * flow without granting admins producer identity or access to private traveler data.
 */
export const ProducerOwnershipAdmin: React.FC<ProducerOwnershipAdminProps> = ({
  enabled,
  onChanged,
}) => (
  <div className="space-y-6">
    <AdminReviewModeration enabled={enabled} onChanged={onChanged} />
    <ProducerMediaModeration enabled={enabled} onChanged={onChanged} />
    <ProducerListingChangeModeration enabled={enabled} onChanged={onChanged} />
    {enabled && <AdminAccountManagement />}
    <ProducerOwnershipManagement enabled={enabled} onChanged={onChanged} />
  </div>
);
