// resources/js/Components/Support/FloatingButton.jsx
import HelpCenterModal from './HelpCenterModal';
import ChatModal from './ChatModal';
import { Headphones } from 'lucide-react';
import { useState, useEffect } from 'react';
export default function FloatingButton({ isAuthenticated = false, currentUser = null }) {
    const [view, setView] = useState('closed'); // 'closed' | 'help' | 'chat'
    const [prefill, setPrefill] = useState('');

    const openHelp = () => setView('help');
    const openChat = () => setView('chat');
    const closeAll = () => setView('closed');

    useEffect(() => {
    window.openYmbChat = () => setView('chat');
    return () => {
        delete window.openYmbChat;
    };
}, []);

    return (
        <>
            {/* Floating button */}
            {view === 'closed' && (
                <button
                    onClick={openHelp}
                    className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
                    title="Help Center"
                    aria-label="Open Help Center"
                >
                    <Headphones size={24} strokeWidth={2.5} />
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></span>
                </button>
            )}

            {/* Help Center modal */}
            {view === 'help' && (
                <HelpCenterModal 
                    onClose={closeAll} 
                    isAuthenticated={isAuthenticated}
                    onChatOpen={openChat}
                />
            )}

            {/* Chat modal */}
            {view === 'chat' && (
                <ChatModal 
                    onClose={closeAll}
                    currentUser={currentUser}
                />
            )}
        </>
    );
}