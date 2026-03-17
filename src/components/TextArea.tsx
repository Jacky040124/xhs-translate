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
      spellCheck={false}
      className="w-full h-[calc(100vh-280px)] min-h-[300px] text-lg leading-relaxed bg-transparent resize-none focus:outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)] font-light tracking-wide"
    />
  );
}
