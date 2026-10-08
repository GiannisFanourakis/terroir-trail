import React from 'react';
import type { Producer } from '../../types/terroir';
import {
  getProducerCategories, getProducerCategoryDetails, getProducerVisitorFeatures,
} from '../../utils/producerCategory';
import { ProducerCategoryIcon } from './ProducerCategoryIcon';
import { Footprints, Sparkles } from 'lucide-react';

export const ProducerCategoryBadges: React.FC<{
  producer: Producer; compact?: boolean; showFeatures?: boolean;
}> = ({ producer, compact = false, showFeatures = true }) => (
  <div className="flex flex-wrap gap-1.5" aria-label="Maker categories and visitor features">
    {getProducerCategories(producer).map((category) => {
      const details = getProducerCategoryDetails(category);
      return (
        <span key={category} data-maker-category={category}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border backdrop-blur-md font-medium ${compact ? 'text-[11px]' : 'text-xs'} ${details.color}`}>
          <ProducerCategoryIcon category={category} className="w-3.5 h-3.5" />
          <span>{details.label}</span>
        </span>
      );
    })}
    {showFeatures && getProducerVisitorFeatures(producer).map((feature) => (
      <span key={feature} data-visitor-feature={feature}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border border-sky-400/30 bg-sky-950/80 text-sky-200 font-medium ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {feature === 'museum' ? <ProducerCategoryIcon category="museum" className="w-3.5 h-3.5" /> :
          feature === 'guided_tour' ? <Footprints className="w-3.5 h-3.5" aria-hidden="true" /> :
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />}
        <span>{feature === 'museum' ? 'Museum' : feature === 'guided_tour' ? 'Guided tours' : 'Tasting'}</span>
      </span>
    ))}
  </div>
);
