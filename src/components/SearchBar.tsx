"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search movies..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border-[1.5px] border-divider rounded-lg text-sm bg-gray-50 outline-none focus:border-brand transition-colors"
    />
  );
}
