package chat

import (
	"bonfire/pkgs"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

// Client represents a WebSocket client.
type Client struct {
	UserID    string
	SessionID string
	Conn      *websocket.Conn
	Closed    chan bool
}

// NewClient creates a new client instance.
func NewClient(userID, sessionID string, conn *websocket.Conn) *Client {
	client := &Client{
		UserID:    userID,
		SessionID: sessionID,
		Conn:      conn,
		Closed:    make(chan bool),
	}

	go client.startSessionChecker()
	return client
}

// startSessionChecker checks if the session is still valid.
func (c *Client) startSessionChecker() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			session, err := pkgs.MainSessionManager.GetSession(c.SessionID)
			if err != nil || session == nil {
				c.CloseConnection()
				return
			}
		case <-c.Closed:
			return
		}
	}
}

// CloseConnection closes the WebSocket connection and unregisters the client.
func (c *Client) CloseConnection() {
	log.Printf("Closing connection for user: %s", c.UserID)
	c.Conn.Close()
	UnregisterClient(c)
	c.Closed <- true
}
