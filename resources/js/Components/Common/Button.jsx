import { useState } from 'react';
import { X } from 'lucide-react';

export default function Button({ children, className = '', variant = 'primary', icon = null, ...props }) {
    const [ripples, setRipples] = useState([]);

    const baseStyles = 'relative px-6 py-2.5 rounded-xl font-semibold shadow-md transition duration-300 transform hover:shadow-lg hover:scale-105 active:scale-95 overflow-hidden cursor-pointer';
    
    const closeStyles = 'relative p-2 rounded-full transition-all duration-300 hover:bg-white hover:bg-opacity-20 cursor-pointer z-10';
    
    const variants = {
        primary: 'bg-blue-700 text-white hover:bg-blue-800',
        secondary: 'bg-white text-blue-700 border-2 border-blue-700 hover:bg-blue-50',
        outline: 'bg-transparent text-blue-700 border-2 border-blue-700 hover:bg-blue-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        close: 'bg-transparent text-white',
    };

    // Get ripple color based on variant
    const getRippleColor = () => {
        if (variant === 'secondary' || variant === 'outline') {
            return 'bg-blue-700'; // Dark ripple for light backgrounds
        }
        return 'bg-white'; // White ripple for dark backgrounds
    };

    const handleClick = (e) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Ripple effect (skip for close button)
        if (variant !== 'close') {
            const ripple = { id: Date.now(), x, y };
            setRipples([ripple]);

            // Remove ripple after animation
            setTimeout(() => {
                setRipples([]);
            }, 600);
        }

        // Call original onClick if exists
        if (props.onClick) {
            props.onClick(e);
        }
    };

    // Close button variant with blue gradient background
    if (variant === 'close') {
        return (
            <button
                {...props}
                onClick={handleClick}
                className={`${closeStyles} group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 ${className}`}
                aria-label="Close"
                title="Close"
            >
                {/* Icon with rotation animation */}
                <div className="relative z-10">
                    {icon || <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />}
                </div>
            </button>
        );
    }

    // Standard button variant
    return (
        <button
            {...props}
            onClick={handleClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className={`absolute ${getRippleColor()} rounded-full opacity-60`}
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: '10px',
                        height: '10px',
                        transform: 'translate(-50%, -50%)',
                        animation: 'ripple 0.6s ease-out',
                    }}
                />
            ))}
            {children}

            <style>{`
                @keyframes ripple {
                    from {
                        width: 10px;
                        height: 10px;
                        opacity: 0.6;
                    }
                    to {
                        width: 300px;
                        height: 300px;
                        opacity: 0;
                    }
                }
            `}</style>
        </button>
    );
}