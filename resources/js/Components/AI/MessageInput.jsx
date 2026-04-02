import Button from '../Common/Button';

export default function MessageInput() {
    return (
        <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
                <Button 
                    variant="primary"
                    className="px-4 py-2"
                >
                    Send
                </Button>
            </div>
        </div>
    );
}