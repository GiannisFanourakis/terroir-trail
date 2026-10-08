import React from 'react';
import type { Producer } from '../../types/terroir';
import {
  getProducerCategories,
  getProducerCategoryDetails,
} from '../../utils/producerCategory';
import { ProducerCategoryIcon } from './ProducerCategoryIcon';

export const ProducerCategoryBadges: React.FC<{
  producer: Producer;
  compact?: boolean;
}> = ({ producer, compact = false }) => (
  <div className="flex flex-wrap gap-1.5" aria-label="Maker categories">
    {getProducerCategories(producer).map((category) => {
      const details = getProducerCategoryDetails(category);
      return (
        <span
          key={category}
          data-maker-category={category}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border backdrop-blur-md font-medium ${compact ? 'text-[11px]' : 'text-xs'} ${details.color}`}
        >
          <ProducerCategoryIcon category={category} className="w-3.5 h-3.5" />
          <span>{details.label}</span>
        </span>
      );
    })}
  </div>
);
