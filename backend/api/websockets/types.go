package websockets

import (
	"bonfire/pkgs/models"
	"encoding/json"
)

// WSMessage represents a WebSocket message.
type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// HistoryRequest represents a request for chat history.
type HistoryRequest struct {
	User1 string `json:"user1"`
	User2 string `json:"user2"`
}

// parseHistoryRequest parses the history request from the payload.
func parseHistoryRequest(payload interface{}) (*HistoryRequest, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	var historyReq HistoryRequest
	if err := json.Unmarshal(payloadBytes, &historyReq); err != nil {
		return nil, err
	}

	return &historyReq, nil
}

// parseChatMessage parses a chat message from the payload.
func parseChatMessage(payload interface{}) (*models.PrivateMessage, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	var msg models.PrivateMessage
	if err := json.Unmarshal(payloadBytes, &msg); err != nil {
		return nil, err
	}

	return &msg, nil
}
