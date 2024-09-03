package server

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gofrs/uuid"
	"github.com/gorilla/websocket"

	"bonfire/pkgs"
	"bonfire/pkgs/models"
)

var clients = make(map[string]*websocket.Conn)
var mutex = &sync.Mutex{} // Mutex to protect the clients map

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow any origin for WebSocket connections
	},
}

type WS_M struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type HistoryRequest struct {
	User1 string `json:"user1"`
	User2 string `json:"user2"`
	msgs  []models.PrivateMessage
}

// Handles the WebSocket connections
func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade the connection to WebSocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("Failed to upgrade to WebSocket:", err)
		return
	}
	defer ws.Close()

	// Retrieve the session ID from cookies
	var sessionID string
	for _, c := range r.Cookies() {
		if c.Name == "session_id" {
			sessionID = c.Value
			break
		}
	}

	// Retrieve the user session based on the session ID
	userSession, err := pkgs.MainSessionManager.GetSession(sessionID)
	if err != nil {
		log.Printf("Failed to get session for sessionID %s: %v", sessionID, err)
		return
	}
	userID := userSession.User.UserID.String()

	// Store the WebSocket connection in the clients map
	mutex.Lock()
	clients[userID] = ws
	mutex.Unlock()

	log.Printf("Client connected: %s", userID)

	// Remove the client from the clients map on disconnect
	defer func() {
		mutex.Lock()
		delete(clients, userID)
		mutex.Unlock()
		log.Printf("Client disconnected: %s", userID)
	}()

	// Handle incoming messages from the WebSocket
	for {
		var ws_msg WS_M
		err := ws.ReadJSON(&ws_msg)
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		if ws_msg.Type == "history" {
			payloadBytes, err := json.Marshal(ws_msg.Payload)
			if err != nil {
				log.Printf("error: %v", err)
				continue
			}

			var historyReq HistoryRequest
			err = json.Unmarshal(payloadBytes, &historyReq)
			if err != nil {
				log.Printf("error: %v", err)
				continue
			}

			chat, err := models.LoadChatHistory(historyReq.User1, historyReq.User2)
			if err != nil {
				log.Printf("error: %v", err)
				continue
			}

			print("chat: %v", chat)

			var history []HistoryRequest
			history = append(history, HistoryRequest{
				User1: historyReq.User1,
				User2: historyReq.User2,
				msgs:  chat,
			})

			historyMsg := WS_M{
				Type:    "history",
				Payload: history,
			}

			ws.WriteJSON(historyMsg)
		} else if ws_msg.Type == "chat" {
			payloadBytes, err := json.Marshal(ws_msg.Payload)
			if err != nil {
				log.Printf("error: %v", err)
				continue
			}

			var msg models.PrivateMessage
			err = json.Unmarshal(payloadBytes, &msg)
			if err != nil {
				log.Printf("error: %v", err)
				continue
			}
			msg.MessageTime = time.Now()
			log.Printf("Received message: %v", msg)

			// Save the message to the database
			// msg.Save()
			// !! for now commented, using fetch to store the messages in the database

			// Send message to a specific client if "to" is specified
			if to := msg.RecipientID; to != uuid.Nil {
				mutex.Lock()
				if client, ok := clients[to.String()]; ok {
					client.WriteJSON(WS_M{Type: "chat", Payload: msg})
				} else {
					log.Printf("Client with ID %s not found", to)
				}
				mutex.Unlock()
			} else {
				// Broadcast to all other clients
				mutex.Lock()
				for id, client := range clients {
					// Avoid sending the message back to the sender
					if id != userID {
						client.WriteJSON(WS_M{Type: "chat", Payload: msg})
					}
				}
				mutex.Unlock()
			}
		}
	}
}
