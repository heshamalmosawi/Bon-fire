import React, { useState } from "react";
import useWebSocket from "@/hooks/useWebSockets";
import chat from "../../../public/chat.png";
import { User } from "@/components/desktop/UserList";

interface ChatProps {
  selectedUser: User | null;
  sessionUser: string;
}

const Chat: React.FC<ChatProps> = ({ selectedUser, sessionUser }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const { messages, sendMessage } = useWebSocket("ws://localhost:8080/ws");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageObject = {
        from: sessionUser,
        to: selectedUser?.user_id,
        message: newMessage,
      };
      sendMessage(JSON.stringify(messageObject));
      setNewMessage("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="w-3/4 h-full flex flex-col border border-customborder">
      <div className="flex items-center justify-between mb-4 m-2">
        <div>
          <h2 className="text-xl font-semibold">{selectedUser?.user_nickname}</h2>
          <p className="text-sm text-gray-400">{selectedUser?.user_fname + " " + selectedUser?.user_lname}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4  border border- p-4">

        {selectedUser ? (
          messages
            .filter((msg) => (msg.from === selectedUser.user_id && msg.to === sessionUser) || (msg.from === sessionUser && msg.to === selectedUser.user_id)) // Filter messages based on selectedUser
            .map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg w-[60%] ${
                  msg.from === sessionUser ? "self-start bg-blue-600 text-white" : "self-end bg-gray-700 text-white"
                }`}
              >
                <strong>{msg.from === sessionUser ? "Me" : selectedUser.user_fname}:</strong> {msg.message}
              </div>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-black">
            <img src={chat.src} alt="chat" style={{maxWidth: "35%"}}/>
            {/* {chat} */}
            <div>
              <div className="text-white mt-auto">No Selected Conversation</div>
              <div className="text-white mt-auto">Select a user to start chatting</div>
            </div>
          </div>
        )}
      </div>
      {selectedUser && (
        // style for the msg from the other person
        //   <div className="self-start bg-gray-700 p-4 rounded-lg">
        //   <p>Here are some nice designs for inspiration 👌</p>
        // </div>
        <div className="flex mt-4 bg-black">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-2 rounded bg-black border border-customborder"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* <button
            className="p-2 bg-blue-500 rounded-r-lg text-white"
            onClick={handleSendMessage}
          >
            Send
          </button> */}
        </div>
      )}
    </div>
  );
};

export default Chat;
