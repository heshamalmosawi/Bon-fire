package server

import (
	"encoding/json"
	"log"
	"net/http"
	"sort"
	"time"

	"bonfire/api/middleware"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
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
	messageTime, err := time.Parse("2006-01-02 15:04:05", time.Now().Format("2006-01-02 15:04:05"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	message.MessageTime = messageTime
	// Save the message to the database
	if err := message.Save(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusCreated)
}

// This API endpoint will return the list of users that they will see in the chat page.
func MessagerListAPI(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		log.Println("MessagerListAPI: ", err)
		w.WriteHeader(http.StatusTeapot)
		return
	}

	list, err := models.GetMessagersList(session.User.UserID)
	if err != nil {
		log.Println("MessagerListAPI: Couldn't get messagers lists: ", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var notMessaged []models.UserModel
	var messaged []models.UserModel
	for _, user := range list {
		if ok, err := models.IsMessaged(user.UserID, session.User.UserID); !ok || err != nil {
			notMessaged = append(notMessaged, user)
		} else {
			messaged = append(messaged, user)
		}
	}

	sort.Slice(notMessaged, func(i, j int) bool {
		return notMessaged[i].UserFirstName < notMessaged[j].UserFirstName
	})

	list = append(messaged, notMessaged...)

	w.Header().Set("Content-Type", "application/json")
	utils.EncodeJSON(w, map[string]interface{}{
		"user":     session.User,
		"response": list,
	})
}
