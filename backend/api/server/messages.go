package server

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"encoding/json"
	"net/http"
	"time"
)

// HandleMessages handles the messages route.
func HandleMessages(w http.ResponseWriter, r *http.Request) {
	// Get query parameters
	user1 := r.URL.Query().Get("user1") // sessionUser
	user2 := r.URL.Query().Get("user2") // selectedUser
	lastMessageId := r.URL.Query().Get("lastMessageId")

	if user1 == "" || user2 == "" {
		http.Error(w, "Missing user1 or user2 parameters", http.StatusBadRequest)
		return
	}

	// Get the messages between user1 and user2
	messages, err := GetMessageHistory(user1, user2, lastMessageId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the messages
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// GetMessageHistory retrieves the message history between two users.
func GetMessageHistory(user1, user2, lastMessageID string) ([]models.PrivateMessage, error) {
	columns := []string{"message_id", "sender_id", "recipient_id", "message_content", "message_timestamp"}
	var condition string
	var args []interface{}

	// Build the base condition for the query
	condition = "((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))"
	args = []interface{}{user1, user2, user2, user1}
	if lastMessageID != "" {
		// Get the last message timestamp
		lastMessage, err := models.GetMessageBySender(lastMessageID) // Ensure this function returns the correct timestamp
		if err != nil {
			return nil, err
		}

		// Add the timestamp condition
		condition += " AND message_timestamp < ?"

		args = append(args, lastMessage.MessageTime)
	}

	// Query the database
	rows, err := utils.Read(
		"private_message",
		columns,
		condition+" ORDER BY message_timestamp DESC LIMIT 10",
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Parse the result rows into the PrivateMessage slice
	var messages []models.PrivateMessage
	for rows.Next() {
		var message models.PrivateMessage
		err := rows.Scan(&message.MessageID, &message.SenderID, &message.RecipientID, &message.MessageContent, &message.MessageTime)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}

	// Reverse the messages to show the oldest first
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

// HandleStoreMessages handles storing new messages.
func HandleStoreMessages(w http.ResponseWriter, r *http.Request) {
	// Decode the incoming message
	var message models.PrivateMessage
	if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	message.MessageTime = time.Now()
	// Save the message to the database
	if err := message.Save(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusCreated)
}
