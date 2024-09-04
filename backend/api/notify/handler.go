package notify

import (
	"bonfire/api/middleware"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow any origin for WebSocket connections
	},
}

func HandleSubscription(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade to WebSocket: %v", err)
		return
	}
	defer ws.Close()

	userSession, err := middleware.Auth(r)
	if err != nil {
		log.Printf("Failed to get session for sessionID %v", err)
		return
	}

	RegisterSubscriber(*userSession, ws)
	defer UnregisterSubscriber(*userSession)
}
