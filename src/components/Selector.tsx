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
  label: string;
}

export function Selector({ options, value, onChange, label }: SelectorProps) {
  return (
    <div className="relative">
      <label className="block text-sm text-gray-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none cursor-pointer hover:border-gray-300 transition-colors"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.emoji ? `${option.emoji} ${option.name}` : option.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-[38px] pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
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
    </div>
  );
}
