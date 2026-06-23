import React from 'react';
import { Star } from 'lucide-react';

export const Rate = ({ value = 0, onChange, disabled = false, className = '', allowHalf = false }) => {
  return (
    <div className={`flex gap-1 items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange && onChange(star)}
          className={`focus:outline-none ${disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <Star 
            className={`w-5 h-5 ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} 
          />
        </button>
      ))}
    </div>
  );
};
