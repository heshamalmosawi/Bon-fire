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
	userSession, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		log.Printf("Failed to get session: %v", err)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade to WebSocket", http.StatusInternalServerError)
		log.Printf("Failed to upgrade to WebSocket: %v", err)
		return
	}

	sub := RegisterSubscriber(*userSession, ws)

	go func() {
		for {
			var req struct {
				Type string `json:"type"`
			}

			if err := sub.Conn.ReadJSON(&req); err != nil {
				log.Printf("Error reading JSON: %v", err)
				UnregisterSubscriber(sub.Session)
				break
			}

			if req.Type == "noti_history" {
				if err := SendAllNotis(sub); err != nil {
					log.Printf("Error sending notis: %v", err)
					UnregisterSubscriber(sub.Session)
				}
				break
			}
		}
	}()
}
