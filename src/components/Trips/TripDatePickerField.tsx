import React, { useRef } from 'react';
import { CalendarDays, X } from 'lucide-react';

interface TripDatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  optional?: boolean;
  compactLabel?: boolean;
}

const formatChosenDate = (value: string): string => {
  if (!value) return 'Choose date';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return 'Choose date';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

export const TripDatePickerField: React.FC<TripDatePickerFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
  optional = true,
  compactLabel = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;

    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch {
      // Fall back to focusing/clicking the native date input.
    }

    input.focus();
    input.click();
  };

  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[11px] font-bold text-stone-400">
        {label}
        {optional && !compactLabel ? ' (optional)' : ''}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          tabIndex={-1}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />

        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          aria-label={`${label}: ${value ? formatChosenDate(value) : 'choose date'}`}
          className="flex min-h-[42px] w-full min-w-0 items-center gap-2 rounded-xl border border-white/15 bg-stone-950 py-2 pl-3 pr-10 text-left text-xs text-white transition hover:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span className={`min-w-0 flex-1 truncate ${value ? 'font-semibold text-stone-100' : 'text-stone-500'}`}>
            {formatChosenDate(value)}
          </span>
        </button>

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 rounded-lg p-1.5 text-stone-500 transition hover:bg-white/5 hover:text-stone-200"
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};
