export default function ChatBubble() {
    return (
        <>
            {/* HEADER MESSAGE */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🤖</span>
                    <div>
                        <p className="font-bold text-gray-800">YMB Assistant</p>
                        <p className="text-xs text-gray-500">Always here to help</p>
                    </div>
                </div>
                <p className="text-sm text-gray-700">
                    👋 Hi! I'm your YMB AI Assistant. How can I help you today?
                </p>
            </div>

            {/* POPULAR ACTIONS */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                <p className="text-xs font-bold text-blue-900 mb-3">✨ POPULAR</p>
                <div className="space-y-2">
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer font-medium">
                        💰 Check Balance
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer font-medium">
                        📊 Recent Transactions
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer font-medium">
                        💸 Send Money
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer font-medium">
                        🎯 Set Savings Goal
                    </button>
                </div>
            </div>

            {/* SECURITY HELP */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                <p className="text-xs font-bold text-blue-900 mb-3">🛡 SECURITY HELP</p>
                <div className="space-y-2">
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer">
                        🔑 Forgot Password
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer">
                        🔐 Change PIN
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer">
                        🚫 Lock My Account
                    </button>
                </div>
            </div>

            {/* LEARN */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                <p className="text-xs font-bold text-blue-900 mb-3">📘 LEARN</p>
                <div className="space-y-2">
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer">
                        💡 How to Start Saving
                    </button>
                    <button className="w-full text-left text-sm text-blue-700 hover:bg-blue-50 p-2 rounded transition-colors duration-200 cursor-pointer">
                        🏦 Understanding Digital Banks
                    </button>
                </div>
            </div>

            {/* SECURITY NOTICE */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                    🔒 All conversations are protected with bank-level encryption.
                </p>
            </div>
        </>
    );
}