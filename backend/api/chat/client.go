package chat

import (
	"log"

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

	return client
}

// CloseConnection closes the WebSocket connection and unregisters the client.
func (c *Client) CloseConnection() {
	log.Printf("Closing connection for user: %s", c.UserID)
	c.Conn.Close()
	UnregisterClient(c)
	c.Closed <- true
}
