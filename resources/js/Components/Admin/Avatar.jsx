// resources/js/Components/Admin/Avatar.jsx
import { useState } from 'react';

/**
 * Avatar with auto-fallback to gradient + initials when image fails to load.
 * Common sizes: sm (32px), md (40px), lg (56px), xl (80px)
 */
export default function Avatar({ 
    src, 
    name = '?', 
    size = 'md', 
    className = '' 
}) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        xs: 'w-5 h-5 text-[9px]',
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-20 h-20 text-2xl',
    };

    const initial = (name || '?').charAt(0).toUpperCase();
    const showImage = src && !imageError;

    if (showImage) {
        return (
            <img 
                src={src}
                alt={name}
                onError={() => setImageError(true)}
                className={`${sizeClasses[size]} rounded-full border border-slate-200 object-cover shrink-0 ${className}`}
                referrerPolicy="no-referrer"
            />
        );
    }

    // Fallback: gradient avatar with initial
    return (
        <div 
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0 ${className}`}
        >
            {initial}
        </div>
    );
}