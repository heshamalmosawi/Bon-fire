import { useEffect, useRef, useState } from "react";

export interface Message {
  message_id?: string; // uuid is a string in JSON
  sender_id: string;
  recipient_id: string;
  message_content: string;
  message_timestamp?: string; // ISO date string for time
}


interface History {
  type: string;
  payload: {
    user1: string;
    user2: string;
    msgs: Message[];
  };
}


const useWebSocket = (url: string, user1: string | null, user2: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    setWs(socket);

    socket.onopen = () => {
      console.log("WebSocket connected");
      // send a history request
      if (user1 && user2) {
        const historyRequest = {
          type: 'history',
          payload: {
            user1: user1,
            user2: user2,
            msgs: [],
          }
        }

        socket.send(JSON.stringify(historyRequest));
      }

    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);
      if (data.type === 'history') {
        setMessages(data.payload.msgs);
      } else {
        // check if previous messages iterable
        if (Symbol.iterator in Object(messages) && messages.length > 0) {
          setMessages((prevMessages) => [...prevMessages, data.payload as Message]);
        }
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [url, user1, user2]);

console.log("messages:", messages);

  const sendMessage = (message: string) => {
    console.log("ws:", ws);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const chatMessage = {
        type: 'chat',
        payload: JSON.parse(message),
      };
      ws.send(JSON.stringify(chatMessage));
      setMessages((prevMessages = []) => [
        ...prevMessages,
        chatMessage.payload,
      ]);
    } else {
      console.error("WebSocket is not connected or still connecting");
    }
  };

  return { messages, sendMessage };
};

export default useWebSocket;
