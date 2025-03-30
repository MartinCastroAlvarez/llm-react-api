import { FC, ChangeEvent } from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

export const Input: FC<InputProps> = ({ value, onChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 text-gray-60 bg-gray-10 border border-gray-30 rounded-lg focus:outline-none focus:border-blue-60"
      placeholder="Enter book ID..."
    />
  );
};
