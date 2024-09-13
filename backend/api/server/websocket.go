package server

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"

	"bonfire/pkgs"
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
		var msg map[string]string
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		log.Printf("Received message: %v", msg)

		// Send message to a specific client if "to" is specified
		if to, ok := msg["receiver_id"]; ok {
			mutex.Lock()
			if client, ok := clients[to]; ok {
				client.WriteJSON(msg)
			} else {
				log.Printf("Client with ID %s not found", to)
			}
			mutex.Unlock()
		} else if group, ok := msg["group_id"]; ok {
			mutex.Lock()
			// TODO: I want to use the group_id to write to all clients that have access to that group?
			for id, client := range clients {
				inGroup := true
				// !! MAYBE WE DON'T NEED THIS, BUT IT IS FOR PRECAUTIONS
				// !! IF FRONTEND FAILS TO RESTRICT USER FROM A GROUP CHAT HE'S NOT PART OF
				// ?? check if client id is in the group
				// TODO: setting inGroup bool to true if client is part of the group
				fmt.Print(group)
				if id != userID && inGroup {
					client.WriteJSON(msg)
				}
			}
			mutex.Unlock()
		} else {
			// Broadcast to all other clients
			mutex.Lock()
			for id, client := range clients {
				// Avoid sending the message back to the sender
				if id != userID {
					client.WriteJSON(msg)
				}
			}
			mutex.Unlock()
		}
	}
}
