package notify

import (
	"bonfire/api/middleware"
	"bonfire/pkgs/models"
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

/*
	hey yall, akhaled here, just wanted to note that
	im sending via ws the updated notis to trigger the
	context in the backend to use the new notis

	please validate and check. xoxo
*/


func DeleteNoti(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	notiID := r.PathValue("id")
	if notiID == "" {
		http.Error(w, "missing notification id", http.StatusBadRequest)
		return
	}

	if err := models.DeleteNotiByID(notiID); err != nil {
		log.Printf("error deleting noti by ID, %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	sub, err := SubscriptionByUser(session.User)
	if err != nil || sub == nil {
		log.Printf("error sending updated notis, %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	if err := SendAllNotis(*sub); err != nil {
		log.Printf("Error sending notis: %v", err)
		UnregisterSubscriber(sub.Session)
	}
}

func ReadAllNotis(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userID := session.User.UserID

	if err := models.MarkAllNotificationsAsRead(userID); err != nil {
		log.Printf("error marking notis as read, %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	sub, err := SubscriptionByUser(session.User)
	if err != nil || sub == nil {
		log.Printf("error sending updated notis, %v", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	if err := SendAllNotis(*sub); err != nil {
		log.Printf("Error sending notis: %v", err)
		UnregisterSubscriber(sub.Session)
	}
}
