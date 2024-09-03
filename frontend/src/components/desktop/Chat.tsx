import React, { useState, useEffect, useRef } from "react";
import useWebSocket from "@/hooks/useWebSockets";
import chat from "../../../public/chat.png";
import { User } from "@/components/desktop/UserList";
import { Message } from "@/hooks/useWebSockets";

interface ChatProps {
  selectedUser: User | null;
  sessionUser: string;
}

const Chat: React.FC<ChatProps> = ({ selectedUser, sessionUser }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const { messages, sendMessage } = useWebSocket("ws://localhost:8080/ws", selectedUser?.user_id ?? null, sessionUser);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (selectedUser) {
      loadInitialChatHistory();  // Load initial chat history when a user is selected
    }
  }, [selectedUser]);

  useEffect(() => {
    // Scroll to the bottom whenever chatHistory changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, messages]);

  const loadInitialChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`http://localhost:8080/messages?user1=${sessionUser}&user2=${selectedUser?.user_id}`);
      const data = await response.json();
      setChatHistory(data);  // Load initial messages
      console.log("Loaded chat history:", data);
      setLoadingHistory(false);
    } catch (error) {
      console.error("Failed to load chat history:", error);
      setLoadingHistory(false);
    }
  };

  const loadMoreMessages = async () => {
    if (loadingHistory || chatHistory.length === 0) return;  // Prevent multiple requests
    try {
      setLoadingHistory(true);
      const lastMessageId = chatHistory[0]?.message_id;  // Get the ID of the oldest loaded message
      const response = await fetch(`http://localhost:8080/messages?user1=${sessionUser}&user2=${selectedUser?.user_id}&lastMessageId=${lastMessageId}`);
      const data = await response.json();
      // Check if the response is an array of messages
      if (Symbol.iterator in Object(data)) {
        setChatHistory((prevHistory) => [...data, ...prevHistory]);  // Prepend the older messages
        console.log("Loaded more messages:", data);
      }
      setLoadingHistory(false);
    } catch (error) {
      console.error("Failed to load more messages:", error);
      setLoadingHistory(false);
    }
  };

  // Scroll event handler
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (scrollTop === 0) {
        loadMoreMessages();  // Load more messages when scrolled to the top
      }
    }
  };

  // Attach the scroll event handler when the component mounts
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => {
        chatContainer.removeEventListener("scroll", handleScroll);  // Cleanup event listener
      };
    }
  }, [chatHistory]);  // Re-attach scroll listener if chat history changes

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const messageObject = {
        from: sessionUser,
        to: selectedUser?.user_id,
        message: newMessage,
        // !! New Field names for thew new message interface
        sender_id: sessionUser,
        recipient_id: selectedUser?.user_id,
        message_content: newMessage,
      };
      
      sendMessage(JSON.stringify(messageObject));

      const newChatMessage : Message = {
        sender_id: sessionUser,
        recipient_id: selectedUser?.user_id ?? "",
        message_content: newMessage,
      };


      if (chatHistory == null) {
        setChatHistory([newChatMessage]);
      } else {
        setChatHistory([...chatHistory, newChatMessage]);
      }
      console.log("Chat history:", chatHistory);
  
      // Store the message in the database
      try {
        const response = await fetch("http://localhost:8080/messages/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newChatMessage),
        });
  
        if (!response.ok) {
          console.error("Failed to store message:", response.statusText);
        }
      } catch (error) {
        console.error("Error storing message:", error);
      }
        
      setNewMessage(""); 
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  // Handle filtering of messages to show only those exchanged between sessionUser and selectedUser
  const handleMessages = (): Message[] => {
    return (
      Array.isArray(messages)
        ? messages.filter(
            (msg) =>
              (msg.sender_id === selectedUser?.user_id  && msg.recipient_id  === sessionUser) ||
              (msg.sender_id === sessionUser && msg.recipient_id  === selectedUser?.user_id)
          )
        : []
    );
  };

  return (
    <div className="w-3/4 h-full flex flex-col border border-customborder">
      <div className="flex items-center justify-between mb-4 m-2">
        <div>
          <h2 className="text-xl font-semibold">{selectedUser?.user_nickname}</h2>
          <p className="text-sm text-gray-400">{selectedUser?.user_fname + " " + selectedUser?.user_lname}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 border border- p-4" ref={chatContainerRef}>
        {selectedUser ? (
          <>
            {chatHistory != null && chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg w-[60%] ${
                  msg.sender_id === sessionUser ? "self-start bg-blue-600 text-white" : "self-end bg-gray-700 text-white"
                }`}
              >
                <strong>{msg.sender_id === sessionUser ? "Me" : selectedUser.user_fname}:</strong> {msg.message_content}
              </div>
            ))}
            {handleMessages().map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg w-[60%] ${
                  msg.sender_id === sessionUser ? "self-start bg-blue-600 text-white" : "self-end bg-gray-700 text-white"
                }`}
              >
                <strong>{msg.sender_id === sessionUser ? "Me" : selectedUser.user_fname}:</strong> {msg.message_content}
              </div>
            ))}
          </>
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
