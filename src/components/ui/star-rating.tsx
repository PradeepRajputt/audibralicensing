
'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  readOnly?: boolean;
}

export const StarRating = ({ rating, setRating, readOnly = false }: StarRatingProps) => {
  const [hover, setHover] = React.useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={cn(
              "p-0 bg-transparent border-none",
              readOnly ? "cursor-default" : "cursor-pointer"
            )}
            onClick={() => !readOnly && setRating && setRating(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            disabled={readOnly}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                ratingValue <= (hover || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground"
              )}
            />
            <span className="sr-only">{ratingValue} star</span>
          </button>
        );
      })}
    </div>
  );
};
