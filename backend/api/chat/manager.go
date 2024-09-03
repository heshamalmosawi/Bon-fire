package chat

import (
	"sync"
)

var (
	clients = make(map[string]*Client)
	mutex   = &sync.Mutex{}
)

// RegisterClient adds a new client to the clients map.
func RegisterClient(client *Client) {
	mutex.Lock()
	defer mutex.Unlock()
	clients[client.UserID] = client
}

// UnregisterClient removes a client from the clients map.
func UnregisterClient(client *Client) {
	mutex.Lock()
	defer mutex.Unlock()
	delete(clients, client.UserID)
}

// GetClientByUserID retrieves a client by their UserID.
func GetClientByID(userID string) (*Client, bool) {
	mutex.Lock()
	defer mutex.Unlock()
	client, exists := clients[userID]
	return client, exists
}
