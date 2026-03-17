"use client";

interface TextAreaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  readOnly,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full h-72 p-4 text-base leading-relaxed border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow ${
        readOnly ? "bg-gray-50" : "bg-white"
      }`}
    />
  );
}
