// Package notify provides functionality for managing WebSocket subscribers.
// It allows registering and unregistering WebSocket connections tied to user sessions.
package notify

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"sync"

	"github.com/gorilla/websocket"
)

type Subscriber struct {
	Conn      *websocket.Conn
	Session   pkgs.Session
	IsUpdated bool
}

// Subscribers is a map that holds the WebSocket connections associated with user sessions.
var (
	Subscribers = make(map[pkgs.Session]Subscriber) // A subscriber subscribes to noti events
	mutex       sync.Mutex                          // Mutex to ensure thread-safe access to Subscribers
)

// RegisterSubscriber registers a new WebSocket connection for a given session after sending it the previous notifications.
// It safely adds the connection to the Subscribers map.
func RegisterSubscriber(session pkgs.Session, conn *websocket.Conn) Subscriber {
	mutex.Lock()
	defer mutex.Unlock()

	Subscribers[session] = Subscriber{
		Conn:      conn,
		Session:   session,
		IsUpdated: false,
	}

	return Subscribers[session]
}

// UnregisterSubscriber removes the WebSocket connection associated with a given session.
// It safely deletes the entry from the Subscribers map and closes the connection.
func UnregisterSubscriber(session pkgs.Session) {
	mutex.Lock()
	defer mutex.Unlock()

	// Ensure the session exists before attempting to close and delete.
	if sub, ok := Subscribers[session]; ok {
		sub.Conn.Close()
		delete(Subscribers, session)
	}
}

// gets subscription websocket conn by user
func SubscriptionByUser(user *models.UserModel) (*Subscriber, error) {
	session, err := pkgs.MainSessionManager.GetSessionByUser(user)
	if err != nil {
		return nil, err
	}

	mutex.Lock()
	defer mutex.Unlock()

	if sub, ok := Subscribers[*session]; ok {
		return &sub, nil
	}

	return nil, nil
}

// removes expired subscriber when his session expires
func RemoveExpiredSubscriber() {
	for {
		UnregisterSubscriber(<-pkgs.ExpiredSessionSubscriberChan)
	}
}
