"use client";

interface Option {
  id: string;
  name: string;
  emoji?: string;
}

interface SelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function Selector({ options, value, onChange }: SelectorProps) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-[var(--text-primary)] text-sm font-medium pr-6 py-1 cursor-pointer focus:outline-none hover:text-[var(--accent)] transition-colors"
      >
        {options.map((option) => (
          <option
            key={option.id}
            value={option.id}
            className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
          >
            {option.emoji ? `${option.emoji} ${option.name}` : option.name}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}
