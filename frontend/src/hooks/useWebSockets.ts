import { useEffect, useRef, useState } from "react";

export interface Message {
  message_id?: string; // uuid is a string in JSON
  sender_id: string;
  recipient_id: string;
  message_content: string;
  message_timestamp?: string; // ISO date string for time
  group_id?: string; 
}

const useWebSocket = (url: string, senderId: string | null, recipientId: string | null, groupId: string | null, handleMessage: (message: Message) => void, SetNewMessageFlag: Function, newMessageFlag: boolean) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    // setWs(socket);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      SetNewMessageFlag(!newMessageFlag);
      console.log("Received message:", newMessageFlag);
      if (message.sender_id === senderId || message.sender_id === recipientId) {
        handleMessage(message);
      } else if (message.group_id === groupId) {
        handleMessage(message);
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
  }, [url, senderId, recipientId, handleMessage]);

  const sendMessage = (message: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      SetNewMessageFlag(!newMessageFlag);
    } else {
      console.error("WebSocket is not connected or still connecting");
    }
  };

  return { sendMessage };
};


export default useWebSocket;
