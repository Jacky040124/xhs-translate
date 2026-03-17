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
      className="w-full h-72 text-base leading-relaxed bg-transparent resize-none focus:outline-none placeholder:text-gray-400"
    />
  );
}
