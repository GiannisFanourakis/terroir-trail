import React from 'react';
import { ProducerMediaModeration } from './ProducerMediaModeration';
import { ProducerOwnershipAdmin as ProducerOwnershipManagement } from './ProducerOwnershipManagement';

interface ProducerOwnershipAdminProps {
  enabled: boolean;
  onChanged?: () => void;
}

/**
 * Keeps producer-content moderation and trusted ownership controls together in
 * the existing Administration flow without granting admins producer identity.
 */
export const ProducerOwnershipAdmin: React.FC<ProducerOwnershipAdminProps> = ({
  enabled,
  onChanged,
}) => (
  <div className="space-y-6">
    <ProducerMediaModeration enabled={enabled} onChanged={onChanged} />
    <ProducerOwnershipManagement enabled={enabled} onChanged={onChanged} />
  </div>
);
