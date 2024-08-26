package server

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
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
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
		return
	}
	defer ws.Close()
	cookies := r.Cookies()
	var clientID string
	for _, c := range cookies {
		if c.Name == "session_id" {
			clientID = c.Value // Get the client ID from the session cookie
		}
	} // ?? Do we need the Session ID or the User ID?
	mutex.Lock()
	clients[clientID] = ws
	mutex.Unlock()

	log.Printf("Client connected: %s", clientID)

	defer func() {
		mutex.Lock()
		delete(clients, clientID)
		mutex.Unlock()
		log.Printf("Client disconnected: %s", clientID)
	}()

	for {
		var msg map[string]string
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		log.Printf("Received: %v", msg)

		// Broadcast message to other clients
		if to, ok := msg["to"]; ok {
			// Send the message to a specific client
			mutex.Lock()
			if client, ok := clients[to]; ok {
				client.WriteJSON(msg)
			}
			mutex.Unlock()
		} else {
			// Broadcast to all clients
			mutex.Lock()
			for id, client := range clients {
				// Don't send the message back to the sender
				if id != clientID {
					client.WriteJSON(msg)
				}
			}
			mutex.Unlock()
		}
	}
}
