import { useState } from 'react';
import type { Product, GoldColor } from '../types';
import ColorPicker from './ColorPicker';
import RatingDisplay from './RatingDisplay';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [selectedColor, setSelectedColor] = useState<GoldColor>('yellow');

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                    src={product.images[selectedColor]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800">
                    {product.name}
                </h3>

                {/* Price */}
                <p className="text-2xl font-bold text-gray-900">
                    {product.priceFormatted}
                </p>

                {/* Color Picker */}
                <ColorPicker
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                />

                {/* Rating */}
                <RatingDisplay rating={product.rating} />
            </div>
        </div>
    );
}