import React from 'react';
import type { Category } from '../../types/terroir';
import { PRODUCER_CATEGORIES, getProducerCategoryDetails } from '../../utils/producerCategory';
import type { ClassificationDraft } from '../../utils/approvedProducerListing';

interface Props {
  primary: Category;
  draft: ClassificationDraft;
  onChange: (draft: ClassificationDraft) => void;
  sourceUrl: string;
  onSourceUrlChange: (value: string) => void;
  disabled: boolean;
}

export const ProducerClassificationEditor: React.FC<Props> = ({
  primary, draft, onChange, sourceUrl, onSourceUrlChange, disabled,
}) => {
  const categories = [primary, ...draft.additionalCategories];
  const updateSection = (category: Category, field: 'specialties' | 'varieties' | 'highlights', value: string) => {
    const existing = draft.productSections.find(section => section.category === category) || { category, specialties: [] };
    onChange({
      ...draft,
      productSections: [...draft.productSections.filter(section => section.category !== category),
        { ...existing, [field]: value.split('\n') }],
    });
  };
  return (
    <fieldset disabled={disabled} className="space-y-3 rounded-xl border border-white/10 bg-stone-950/40 p-3">
      <legend className="px-1 text-xs font-semibold text-stone-200">Maker categories and products</legend>
      <p className="text-[11px] text-stone-400">Primary category: {getProducerCategoryDetails(primary).label}. Choose what you make. Tasting, tours and museums use Visiting &amp; Access.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {PRODUCER_CATEGORIES.filter(category => category !== primary).map(category => (
          <label key={category} className="flex items-center gap-2 text-xs text-stone-300">
            <input type="checkbox" checked={draft.additionalCategories.includes(category)}
              onChange={event => onChange({ ...draft,
                additionalCategories: event.target.checked
                  ? [...draft.additionalCategories, category]
                  : draft.additionalCategories.filter(value => value !== category),
              })} />
            {getProducerCategoryDetails(category).label}
          </label>
        ))}
      </div>
      {categories.map(category => {
        const section = draft.productSections.find(value => value.category === category);
        return (
          <div key={category} className="space-y-2 border-t border-white/10 pt-3" data-product-editor-category={category}>
            <h4 className="text-xs font-semibold text-amber-200">{getProducerCategoryDetails(category).label}</h4>
            {(['specialties', 'varieties', 'highlights'] as const).map(field => (
              <label key={field} className="block text-[11px] text-stone-300">
                {field === 'specialties' ? 'Products / specialties' : field === 'varieties' ? 'Varieties (optional)' : 'Highlights (optional)'}
                <textarea rows={field === 'specialties' ? 3 : 2} value={(section?.[field] || []).join('\n')}
                  onChange={event => updateSection(category, field, event.target.value)}
                  placeholder="One item per line"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-xs text-white disabled:opacity-60" />
              </label>
            ))}
          </div>
        );
      })}
      <label className="block text-xs text-stone-300">
        Official source for these changes
        <input type="url" value={sourceUrl} onChange={event => onSourceUrlChange(event.target.value)}
          maxLength={500} placeholder="https://your-website/products"
          className="mt-1 w-full rounded-lg border border-white/10 bg-stone-900 px-3 py-2 text-xs text-white disabled:opacity-60" />
      </label>
      <p className="text-[11px] text-stone-400">Category and product changes require a source and Admin approval.</p>
    </fieldset>
  );
};
