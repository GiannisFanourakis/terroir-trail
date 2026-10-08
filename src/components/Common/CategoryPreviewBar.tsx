import React from 'react';

const examples = [
  { id: 'anoskeli-estate', label: 'Dual · Anoskeli', country: 'GR', destination: 'crete' },
  { id: 'tyrnavos-winery-cooperative-thessaly', label: 'Wine + spirits · Tyrnavos', country: 'GR', destination: 'thessaly' },
  { id: 'hardanger-saft-siderfabrikk-vestland', label: 'Cider + spirits · Hardanger', country: 'NO', destination: 'vestland' },
  { id: 'fattoria-corzano-e-paterno-tuscany', label: 'Triple · Corzano e Paterno', country: 'IT', destination: 'tuscany' },
  { id: 'cascina-barroero-piedmont', label: 'Triple · Cascina Barroero', country: 'IT', destination: 'piedmont' },
  { id: 'la-vinyeta-catalonia', label: 'Four · La Vinyeta', country: 'ES', destination: 'catalonia' },
  { id: 'canava-santorini-distillery', label: 'Museum · Canava Santorini', country: 'GR', destination: 'santorini' },
];

export const CategoryPreviewBar: React.FC = () => {
  const focused = new URLSearchParams(window.location.search).get('focus') || examples[0].id;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6 bg-sky-950 text-sky-100 border-b border-sky-700 shrink-0">
      <span className="text-xs font-medium">Category preview</span>
      <label className="flex items-center gap-2 min-w-0 flex-1 sm:flex-none">
        <span className="sr-only">Preview producer</span>
        <select aria-label="Preview producer" value={focused}
          className="min-w-0 w-full sm:w-auto min-h-[36px] rounded-lg bg-stone-900 border border-sky-700 text-xs px-2 py-1.5 text-sky-100"
          onChange={(event) => {
            const example = examples.find((item) => item.id === event.target.value);
            if (!example) return;
            const url = new URL(window.location.href);
            url.search = new URLSearchParams({
              preview: 'categories', country: example.country,
              destination: example.destination, focus: example.id,
            }).toString();
            window.location.assign(url);
          }}>
          {examples.map((example) => <option key={example.id} value={example.id}>{example.label}</option>)}
        </select>
      </label>
    </div>
  );
};
