import React, { useState } from "react";
import useWebSocket from "@/hooks/useWebSockets";

interface ChatProps {
  selectedUser: string | null;
}

const Chat: React.FC<ChatProps> = ({ selectedUser }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const { messages, sendMessage } = useWebSocket("ws://localhost:8080/ws");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageObject = { 
        from: "MY_NAME?",
        to: selectedUser,
        message: newMessage,
      };
      sendMessage(JSON.stringify(messageObject));
      setNewMessage("");
    }
  };

  return (
    <div className="w-3/4 h-full bg-gray-800 p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {selectedUser ? (
          messages
            .filter((msg) => msg.to === selectedUser) // Filter messages based on selectedUser
            .map((msg, index) => (
              <div key={index} className="p-2 text-white">
                <strong>{msg.from}:</strong> {msg.message}
              </div>
            ))
        ) : (
          <div className="text-white">Select a user to start chatting</div>
        )}
      </div>
      {selectedUser && (
        <div className="flex mt-4">
          <input
            type="text"
            className="flex-1 p-2 rounded-l-lg"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="p-2 bg-blue-500 rounded-r-lg text-white"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
