// Package notify provides functionality for managing WebSocket subscribers.
// It allows registering and unregistering WebSocket connections tied to user sessions.
package notify

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"sync"

	"github.com/gorilla/websocket"
)

// Subscribers is a map that holds the WebSocket connections associated with user sessions.
var (
	Subscribers = make(map[pkgs.Session]*websocket.Conn) // A subscriber subscribes to noti events
	mutex       sync.Mutex                               // Mutex to ensure thread-safe access to Subscribers
)

// RegisterSubscriber registers a new WebSocket connection for a given session.
// It safely adds the connection to the Subscribers map.
func RegisterSubscriber(session pkgs.Session, conn *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()

	Subscribers[session] = conn
}

// UnregisterSubscriber removes the WebSocket connection associated with a given session.
// It safely deletes the entry from the Subscribers map and closes the connection.
func UnregisterSubscriber(session pkgs.Session) {
	mutex.Lock()
	defer mutex.Unlock()

	// Ensure the session exists before attempting to close and delete.
	if conn, ok := Subscribers[session]; ok {
		conn.Close()
		delete(Subscribers, session)
	}
}

// gets subscription websocket conn by user
func SubscriptionByUser(user *models.UserModel) *websocket.Conn {
	session, err := pkgs.MainSessionManager.GetSessionByUser(user)
	if err != nil {
		return nil
	}

	var ws *websocket.Conn
	mutex.Lock()
	defer mutex.Unlock()

	if conn, ok := Subscribers[*session]; ok {
		ws = conn
	}

	return ws
}

// removes expired subscriber when his session expires
func RemoveExpiredSubscriber() {
	for {
		UnregisterSubscriber(<-pkgs.ExpiredSessionSubscriberChan)
	}
}
