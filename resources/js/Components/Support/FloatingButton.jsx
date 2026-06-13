// resources/js/Components/Support/FloatingButton.jsx
import { useState } from 'react';
import HelpCenterModal from './HelpCenterModal';
import { MessageCircle } from 'lucide-react';

export default function FloatingButton({ isAuthenticated = false }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
                    title="Help Center"
                    aria-label="Open Help Center"
                >
                    <MessageCircle size={24} strokeWidth={2.5} />
                    
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></span>
                </button>
            )}

            {/* Modal */}
            {isOpen && (
                <HelpCenterModal 
                    onClose={() => setIsOpen(false)} 
                    isAuthenticated={isAuthenticated}
                />
            )}
        </>
    );
}