import React from 'react';

/**
 * A simple card component used to present selectable options in the
 * multi‑step form.  The card highlights itself when selected and
 * dispatches its value when clicked.  Generic typing allows it to
 * support arbitrary string unions for the option values.
 */
export interface OptionCardProps<T extends string> {
  /** The internal value associated with this option. */
  value: T;
  /** The title displayed to the user. */
  label: string;
  /** Optional explanatory text shown below the label. */
  description?: string;
  /** Whether this option is currently selected. */
  selected: boolean;
  /** Callback invoked when the user clicks on the card. */
  onSelect: (value: T) => void;
}

export function OptionCard<T extends string>(props: OptionCardProps<T>) {
  const { value, label, description, selected, onSelect } = props;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={
        [
          'w-full text-left p-4 border rounded-xl transition-colors',
          selected
            ? 'bg-primary-light border-primary text-primary'
            : 'bg-white border-gray-300 hover:border-primary'
        ].join(' ')
      }
    >
      <div className="font-semibold text-base md:text-lg">{label}</div>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
    </button>
  );
}