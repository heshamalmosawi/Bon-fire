import React, { useState, useEffect, useRef } from "react";
import useWebSocket from "@/hooks/useWebSockets";
import chat from "../../../public/chat.png";
import { User } from "@/components/desktop/UserList";
import { Message } from "@/hooks/useWebSockets";
import { Button } from "../ui/button";

import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from '@/components/chat/chat-bubble';
import { format } from 'date-fns'; // Import the 'format' function from 'date-fns'
import { ChatInput } from '@/components/chat/chat-input'
import { ExpandableChat, ExpandableChatHeader, ExpandableChatBody, ExpandableChatFooter } from '@/components/chat/expandable-chat'
import { ChatMessageList } from '@/components/chat/chat-message-list'

interface ChatProps {
  selectedUser: User | null;
  sessionUser: User | null;
}

const Chat: React.FC<ChatProps> = ({ selectedUser, sessionUser }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);


    // Define a function to handle incoming messages
  const handleMessage = (message: Message) => {
    setChatHistory((prevHistory) => [ ...(prevHistory || []), message]);
  };

  useWebSocket("ws://localhost:8080/ws", sessionUser?.user_id ?? null, selectedUser?.user_id ?? null, handleMessage);

    

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
  }, [newMessage, selectedUser]);

  const loadInitialChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`http://localhost:8080/messages?user1=${sessionUser?.user_id}&user2=${selectedUser?.user_id}`);
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
      const response = await fetch(`http://localhost:8080/messages?user1=${sessionUser?.user_id}&user2=${selectedUser?.user_id}&lastMessageId=${lastMessageId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setChatHistory((prevHistory) => [...data, ...(prevHistory || [])]);  // Prepend the older messages
        console.log("Loaded more messages:", data);
      }
      setLoadingHistory(false);
      if (chatContainerRef.current && chatHistory.length > 0) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - chatContainerRef.current.clientHeight - lastScrollTop;
      }
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
        setLastScrollTop(scrollTop);
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
    setNewMessage("");
  }, [chatHistory]);  // Re-attach scroll listener if chat history changes

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const newChatMessage: Message = {
        sender_id: sessionUser?.user_id ?? "",
        recipient_id: selectedUser?.user_id ?? "",
        message_content: newMessage,
      };

      const messageString = JSON.stringify(newChatMessage);
      const ws = new WebSocket("ws://localhost:8080/ws");
      ws.onopen = () => {
        ws.send(messageString);
      };

      // Update chat history only here
      setChatHistory((prevHistory) => [ ...(prevHistory || []), newChatMessage]);
      setNewMessage("");

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
        } else {
          console.log("clear");
          setNewMessage("");
        }
      } catch (error) {
        console.error("Error storing message:", error);
      } 
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
      setNewMessage(""); // Clear the input
    }
  };

  // Handle filtering of messages to show only those exchanged between sessionUser and selectedUser
  const handleMessages = (): Message[] => {
    return (
      Array.isArray(chatHistory)
        ? chatHistory.filter(
          (msg) =>
            (msg.sender_id === selectedUser?.user_id && msg.recipient_id === sessionUser?.user_id) ||
            (msg.sender_id === sessionUser?.user_id && msg.recipient_id === selectedUser?.user_id)
        )
        : []
    );
  };

  return (
    // <>
    <div className="flex flex-col h-full w-full">
      <ExpandableChatHeader>
        {selectedUser ? (
          <div className="flex items-center space-x-2">
            <ChatBubbleAvatar src={selectedUser.user_profile_pic || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg"} fallback={selectedUser.user_nickname} className="bg-gray-500" />
            <div>
              <h2 className="text-lg font-semibold">{selectedUser.user_nickname}</h2>
              <p className="text-sm text-gray-500">{selectedUser.user_fname} {selectedUser.user_lname}</p>
            </div>
          </div>
        ) : (
          <h2 className="text-lg font-semibold">Select a user to chat</h2>
        )}
      </ExpandableChatHeader>
      <ExpandableChatBody>
        <ChatMessageList ref={chatContainerRef}>
          {selectedUser ? (
            <>
              {chatHistory != null && chatHistory.map((msg, index) => (
                <ChatBubble key={index} variant={msg.sender_id === sessionUser?.user_id ? "sent" : "received"}>
                  <ChatBubbleAvatar
                    src={msg.sender_id === sessionUser?.user_id ? sessionUser?.user_profile_pic || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg" : selectedUser.user_profile_pic || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg"}
                    fallback={msg.sender_id === sessionUser?.user_id ? sessionUser?.user_nickname : selectedUser?.user_nickname}
                  />
                  <ChatBubbleMessage variant={msg.sender_id === sessionUser?.user_id ? "sent" : "received"}>
                    {msg.message_content}
                  </ChatBubbleMessage>
                  <ChatBubbleTimestamp timestamp={msg.message_timestamp?.toString() || new Date().toLocaleTimeString()} />
                </ChatBubble>
                // <div
                //   key={index}
                //   className={`p-4 rounded-lg w-[60%] ${msg.sender_id === sessionUser ? "self-start bg-blue-600 text-white" : "self-end bg-gray-700 text-white"
                //     }`}
                // >
                //   <strong>
                //     {msg.sender_id === sessionUser ? "Me" : selectedUser.user_fname}:
                //   </strong> {msg.message_content}
                // </div>
              ))}
              {/* {handleMessages().map((msg, index) => (
                <ChatBubble key={index} variant={msg.sender_id === sessionUser?.user_id ? "sent" : "received"}>
                  <ChatBubbleAvatar
                    src={msg.sender_id === sessionUser?.user_id ? sessionUser?.user_id : selectedUser.user_profile_pic || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg"}
                    fallback={msg.sender_id === sessionUser?.user_id ? sessionUser?.user_nickname : selectedUser?.user_nickname}
                  />
                  <ChatBubbleMessage variant={msg.sender_id === sessionUser?.user_id ? "sent" : "received"}>
                    {msg.message_content}
                  </ChatBubbleMessage>
                  <ChatBubbleTimestamp timestamp={msg.message_timestamp?.toString() || new Date().toLocaleTimeString()} />
                </ChatBubble>
              ))} */}
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
        </ChatMessageList>
      </ExpandableChatBody>
      {selectedUser && (
        <ExpandableChatFooter>
          <div className="flex items-center space-x-2">
            <ChatInput
              placeholder="Type your message..."
              className="w-full p-2 rounded bg-black border border-customborder"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button 
            className="py-10 rounded-r-lg text-white"
            size="sm" onClick={handleSendMessage}>
              {/* <CornerDownLeft className="h-4 w-4" /> */}
              Send
            </Button>
          </div>
        </ExpandableChatFooter>
      )}
    </div>
    /* <div className="flex flex-col h-full">
      <ChatMessageList>
        {messages.map((msg, index) => (
          <ChatBubble key={index}>
            <ChatBubbleAvatar src={msg.from === sessionUser?.user_id ? sessionUser.user_profile_pic : selectedUser?.user_profile_pic} />
            <ChatBubbleMessage>
              {msg.message}
            </ChatBubbleMessage>
          </ChatBubble> C
        ))}
      </ChatMessageList>
      <div className="flex-1" />
      <div className="flex items-center gap-2 p-4">
        <ChatInput
          placeholder="Type your message here..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button size="sm" className="ml-auto gap-1.5" onClick={handleSendMessage}>
          Send Message
          <CornerDownLeft className="size-3.5" />
        </Button>
      </div>
    </div> */
    /* </> */




    // <div className="w-3/4 h-full flex flex-col border border-customborder">
    //   <div className="flex items-center justify-between mb-4 m-2">
    //     <div>
    //       <h2 className="text-xl font-semibold">{selectedUser?.user_nickname}</h2>
    //       <p className="text-sm text-gray-400">{selectedUser?.user_fname + " " + selectedUser?.user_lname}</p>
    //     </div>
    //   </div>
    //   <div className="flex-1 overflow-y-auto space-y-4 border border- p-4" ref={chatContainerRef}>
    //     {selectedUser ? (
    //       <>
    //         {chatHistory != null && chatHistory.map((msg, index) => (
    //           <div
    //             key={index}
    //             className={`p-4 rounded-lg w-[60%] ${
    //               msg.sender_id === sessionUser ? "self-start bg-blue-600 text-white" : "self-end bg-gray-700 text-white"
    //             }`}
    //           >
    //             <strong>{msg.sender_id === sessionUser ? "Me" : selectedUser.user_fname}:</strong> {msg.message_content}
    //           </div>
    //         ))}
    //         {handleMessages().map((msg, index) => (
    //           <div
    //             key={index}
    //             className={`p-4 rounded-lg w-[60%] ${
    //               msg.sender_id === sessionUser ? "self-start bg-blue-600 text-white" : "self-end bg-gray-700 text-white"
    //             }`}
    //           >
    //             <strong>{msg.sender_id === sessionUser ? "Me" : selectedUser.user_fname}:</strong> {msg.message_content}
    //           </div>
    //         ))}
    //       </>
    //     ) : (
    //       <div className="flex flex-col items-center justify-center h-full bg-black">
    //         <img src={chat.src} alt="chat" style={{ maxWidth: "35%" }} />
    //         {/* {chat} */}
    //         <div>
    //           <div className="text-white mt-auto">No Selected Conversation</div>
    //           <div className="text-white mt-auto">Select a user to start chatting</div>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    //   {selectedUser && (
    //     // style for the msg from the other person
    //     //   <div className="self-start bg-gray-700 p-4 rounded-lg">
    //     //   <p>Here are some nice designs for inspiration 👌</p>
    //     // </div>
    //     <div className="flex mt-4 bg-black">
    //       <input
    //         type="text"
    //         placeholder="Type your message..."
    //         className="w-full p-2 rounded bg-black border border-customborder"
    //         value={newMessage}
    //         onChange={(e) => setNewMessage(e.target.value)}
    //         onKeyDown={handleKeyDown}
    //       />
    //       {/* <button
    //         className="p-2 bg-blue-500 rounded-r-lg text-white"
    //         onClick={handleSendMessage}
    //       >
    //         Send
    //       </button> */}
    //     </div>
    //   )}
    // </div>
  );
};


export default Chat;
