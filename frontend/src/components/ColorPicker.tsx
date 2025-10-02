import { GOLD_COLORS } from '../constants/colors';
import type { GoldColor } from '../types';

interface ColorPickerProps {
    selectedColor: GoldColor;
    onColorChange: (color: GoldColor) => void;
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
                {GOLD_COLORS.find(c => c.key === selectedColor)?.name}
            </span>

            <div className="flex gap-2">
                {GOLD_COLORS.map((color) => (
                    <button
                        key={color.key}
                        onClick={() => onColorChange(color.key)}
                        className={`
              w-8 h-8 rounded-full border-2 transition-all
              ${selectedColor === color.key
                                ? 'border-gray-800 scale-110'
                                : 'border-gray-300 hover:border-gray-500'
                            }
            `}
                        style={{ backgroundColor: color.hex }}
                        aria-label={color.name}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
}