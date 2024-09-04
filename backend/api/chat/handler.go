package chat

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	"bonfire/api/middleware"
	"bonfire/pkgs/models"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow any origin for WebSocket connections
	},
}

// Handles the WebSocket connections
func HandleConnections(w http.ResponseWriter, r *http.Request) {
	userSession, err := middleware.Auth(r)
	if err != nil {
		log.Printf("Failed to get session for sessionID %v", err)
		return
	}
	
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade to WebSocket: %v", err)
		return
	}
	defer ws.Close()

	userID := userSession.User.UserID.String()

	client := NewClient(userID, userSession.ID, ws)
	RegisterClient(client)
	defer client.CloseConnection()

	handleIncomingMessages(client)
}

func handleIncomingMessages(client *Client) {
	for {
		var msg WSMessage
		err := client.Conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error reading JSON: %v", err)
			client.CloseConnection()
			break
		}

		switch msg.Type {
		case "history":
			handleHistoryRequest(client, msg.Payload)
		case "chat":
			handleChatMessage(msg.Payload)
		}
	}
}

func handleHistoryRequest(client *Client, payload interface{}) {
	historyReq, err := parseHistoryRequest(payload)
	if err != nil {
		log.Printf("Failed to parse history request: %v", err)
		return
	}

	chat, err := models.LoadChatHistory(historyReq.User1, historyReq.User2)
	if err != nil {
		log.Printf("Failed to load chat history: %v", err)
		return
	}

	historyMsg := WSMessage{
		Type:    "history",
		Payload: chat,
	}

	if err := client.Conn.WriteJSON(historyMsg); err != nil {
		client.CloseConnection()
	}
}

func handleChatMessage(payload interface{}) {
	msg, err := parseChatMessage(payload)
	if err != nil {
		log.Printf("Failed to parse chat message: %v", err)
		return
	}

	msg.MessageTime = time.Now()
	if err := msg.Save(); err != nil {
		log.Printf("Failed to save message: %v", err)
		return
	}

	if toClient, exists := GetClientByID(msg.RecipientID.String()); exists {
		if err := toClient.Conn.WriteJSON(WSMessage{Type: "chat", Payload: msg}); err != nil {
			toClient.CloseConnection()
		}
	} else {
		log.Printf("Recipient client not online: %s", msg.RecipientID)
	}
}
