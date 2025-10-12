import React from 'react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-slate-300 whitespace-nowrap">{label}</label>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        // Removes the default color picker styling to apply our own
        className="appearance-none w-8 h-8 p-0 bg-transparent border-2 border-slate-600 rounded-md cursor-pointer
                   [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm
                   [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-sm"
      />
    </div>
  );
};

export default ColorPicker;
