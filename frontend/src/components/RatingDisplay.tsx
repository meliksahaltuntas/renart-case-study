interface RatingDisplayProps {
    rating: number;
}

export default function RatingDisplay({ rating }: RatingDisplayProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {/* Full stars */}
            {Array.from({ length: fullStars }).map((_, i) => (
                <span key={`full-${i}`} className="text-yellow-400">★</span>
            ))}

            {/* Half star */}
            {hasHalfStar && <span className="text-yellow-400">⯨</span>}

            {/* Empty stars */}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <span key={`empty-${i}`} className="text-gray-300">☆</span>
            ))}

            <span className="ml-1 text-sm text-gray-600">
                {rating.toFixed(1)}/5
            </span>
        </div>
    );
}