import React, { useState, useEffect } from "react";
// import useWebSocket from "@/hooks/useWebSockets";
import chat from "../../../public/chat.png";
import { User } from "@/components/desktop/UserList";
import { useChatWebSocket } from "@/context/ChatWebsocketContext";
import { chatMessage } from "@/lib/interfaces";

interface ChatProps {
  selectedUser: User | null;
  sessionUser: string;
}

const Chat: React.FC<ChatProps> = ({ selectedUser, sessionUser }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setmessages] = useState<chatMessage[]>([])
  const { socket, setOnMessage } = useChatWebSocket()


  const sendMessage = (data: string) => {
    socket?.send(JSON.stringify({
      type: "chat",
      payload: data
    }))
  }

  useEffect(() => {
    setOnMessage((ev) => {
      if (ev.data.type === "history") {
        setmessages(ev.data.payload)
      } else if (ev.data.type === "chat") {
        setmessages([...messages, ev.data.payload as chatMessage])
      }
    })
  }, [])

  useEffect(() => {
    if (selectedUser) {
      handleChatClick();
    }
  }, [selectedUser]);

  const handleChatClick = () => {
    if (selectedUser) {
      console.log("handling chat history");
      const historyRequest = {
        type: 'history',
        payload: {
          user1: sessionUser,
          user2: selectedUser.user_id,
        },
      };
      sendMessage(JSON.stringify(historyRequest));
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("sending message");
      const messageObject = {
        from: sessionUser,
        to: selectedUser?.user_id,
        message: newMessage,
      };
      sendMessage(JSON.stringify(messageObject));
      setNewMessage("");
      handleChatClick();
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
          Array.isArray(messages) && messages
            .filter((msg) => (msg.from === selectedUser.user_id && msg.to === sessionUser) || (msg.from === sessionUser && msg.to === selectedUser.user_id)) // Filter messages based on selectedUser
            .map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg w-[60%] ${msg.from === sessionUser ? "self-start bg-blue-600 text-white" : "self-end bg-gray-700 text-white"
                  }`}
              >
                <strong>{msg.from === sessionUser ? "Me" : selectedUser.user_fname}:</strong> {msg.message}
              </div>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-black">
            <img src={chat.src} alt="chat" style={{ maxWidth: "35%" }} />
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
