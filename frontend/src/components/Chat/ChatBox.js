import React, { useState } from "react";
import { Minus } from "lucide-react";

const ChatBox = ({ user, onClose }) => {
    const [minimized, setMinimized] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    const handleSend = () => {
        if (message.trim() === "") return;
        setChatHistory((prev) => [...prev, { from: "me", text: message }]);
        setMessage("");
        // fake response
        setTimeout(() => {
            setChatHistory((prev) => [...prev, { from: user.name, text: "👍" }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-[#1c1c1c] rounded-lg shadow-xl border border-yellow-400 z-50 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center bg-yellow-500/10 px-4 py-2 border-b border-yellow-400/30 rounded-t-lg">
                <span className="text-yellow-300 font-semibold">{user.name}</span>
                <div className="flex gap-2">
                    <button
                        className="text-yellow-400 hover:text-yellow-200"
                        onClick={() => setMinimized(!minimized)}
                    >
                        <Minus size={18} />
                    </button>
                    <button
                        className="text-red-400 hover:text-red-200"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
            </div>

            {!minimized && (
                <>
                    {/* Chat body */}
                    <div className="flex-1 p-3 space-y-2 h-56 overflow-y-auto text-sm">
                        {chatHistory.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${msg.from === "me" ? "text-right text-green-400" : "text-gray-300"
                                    }`}
                            >
                                <span>{msg.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="flex p-2 border-t border-yellow-400/20">
                        <input
                            className="flex-1 bg-transparent border border-yellow-500/20 rounded px-2 py-1 text-gray-100"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type a message..."
                        />
                        <button
                            className="ml-2 px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-300"
                            onClick={handleSend}
                        >
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ChatBox;