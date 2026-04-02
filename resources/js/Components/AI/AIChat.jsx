import { useState } from 'react';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';

export default function AIChat() {
    const [showAIChat, setShowAIChat] = useState(false);

    return (
        <>
            {/* AI ASSISTANT FLOATING BUTTON - Z-40 */}
            {!showAIChat && (
                <button
                    onClick={() => setShowAIChat(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer z-40"
                    title="AI Assistant"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-8 w-8" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                        />
                    </svg>
                </button>
            )}

            {/* AI CHAT WIDGET - Z-50 */}
            {showAIChat && (
                <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col z-50">
                    {/* HEADER */}
                    <div className="bg-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <div>
                                <h4 className="font-bold">YMB Assistant</h4>
                                <p className="text-xs text-blue-100">Always here to help</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowAIChat(false)}
                            className="hover:bg-blue-600 rounded-full p-1 transition-colors duration-200 cursor-pointer"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-6 w-6" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </svg>
                        </button>
                    </div>

                    {/* CHAT MESSAGES */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        <ChatBubble />
                    </div>

                    {/* MESSAGE INPUT */}
                    <MessageInput />
                </div>
            )}

            {/* CLICKABLE AREA OUTSIDE CHAT - Z-30 (invisible, only closes chat) */}
            {showAIChat && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowAIChat(false)}
                    style={{ background: 'transparent' }}
                />
            )}
        </>
    );
}