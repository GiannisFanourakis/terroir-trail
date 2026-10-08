import React from 'react';
import type { ProducerProductSection } from '../../types/terroir';
import { getProducerCategoryDetails } from '../../utils/producerCategory';
import { ProducerCategoryIcon } from './ProducerCategoryIcon';

export const ProducerProductSections: React.FC<{
  sections: ProducerProductSection[];
}> = ({ sections }) => (
  <div className="space-y-4">
    {sections.map((section) => (
      <section key={section.category} data-product-category={section.category}
        className="space-y-2 border-b border-white/5 pb-4 last:border-0">
        <h4 className="flex items-center gap-2 text-sm font-medium text-stone-100">
          <ProducerCategoryIcon category={section.category} className="w-4 h-4 text-amber-300" />
          {getProducerCategoryDetails(section.category).label}
        </h4>
        {section.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {section.specialties.map((specialty) => (
              <span key={specialty} className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">{specialty}</span>
            ))}
          </div>
        )}
        {Boolean(section.varieties?.length) && (
          <p className="text-xs text-stone-300">
            <span className="text-stone-400">Varieties: </span>{section.varieties!.join(' · ')}
          </p>
        )}
        {Boolean(section.highlights?.length) && (
          <ul className="space-y-1 text-xs text-stone-300 list-disc pl-4">
            {section.highlights!.map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        )}
      </section>
    ))}
  </div>
);
