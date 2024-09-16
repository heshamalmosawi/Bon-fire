package server

import (
	"encoding/json"
	"log"
	"net/http"
	"slices"
	"sort"
	"time"

	"bonfire/api/middleware"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"

	"github.com/gofrs/uuid"
	// "github.com/gofrs/uuid"
)

// HandleMessages handles the messages route.
func HandleMessages(w http.ResponseWriter, r *http.Request) {
	// Get query parameters
	user1 := r.URL.Query().Get("user1") // sessionUser
	user2 := r.URL.Query().Get("user2") // selectedUser
	group := r.URL.Query().Get("group_id")
	lastMessageId := r.URL.Query().Get("lastMessageId")

	if (user1 == "" || user2 == "") && group == "" {
		http.Error(w, "Missing user1 or user2 parameters and group parameters", http.StatusBadRequest)
		return
	}

	// Get the messages between user1 and user2
	var messages []interface{}
	var err error
	if group != "" {
		messages, err = GetMessageHistory("", "", lastMessageId, group)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		messages, err = GetMessageHistory(user1, user2, lastMessageId, "")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Send the messages
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

// GetMessageHistory retrieves the message history between two users.
func GetMessageHistory(user1, user2, lastMessageID, groupID string) ([]interface{}, error) {
	var messages []interface{}
	var columns []string
	var condition string
	var args []interface{}
	// var rows *sql.Rows
	var table string
	// var err error

	// Build the base condition for the query
	if groupID != "" {
		// Get group messages
		columns = []string{"message_id", "sender_id", "group_id", "message_content", "message_timestamp"}
		condition = "group_id = ?"
		table = "group_message"
		args = []interface{}{groupID}
		// rows, err = utils.Read("group_message", columns, condition, groupID)
	} else {
		// Get private messages
		columns = []string{"message_id", "sender_id", "recipient_id", "message_content", "message_timestamp"}
		condition = "((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))"
		args = []interface{}{user1, user2, user2, user1}
		table = "private_message"
		// rows, err = utils.Read("private_message", columns, condition, user1, user2, user2, user1)
	}

	// if err != nil {
	//     return nil, err
	// }
	// defer rows.Close()
	// args = []interface{}{user1, user2, user2, user1}
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
		table,
		columns,
		condition+" ORDER BY message_timestamp DESC LIMIT 10",
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Parse the result rows into the PrivateMessage slice
	for rows.Next() {
		if groupID != "" {
			var message models.GroupMessage
			err := rows.Scan(&message.MessageID, &message.SenderID, &message.GroupID, &message.MessageContent, &message.MessageTime)
			if err != nil {
				return nil, err
			}
			messages = append(messages, message)
		} else {
			var message models.PrivateMessage
			err := rows.Scan(&message.MessageID, &message.SenderID, &message.RecipientID, &message.MessageContent, &message.MessageTime)
			if err != nil {
				return nil, err
			}
			messages = append(messages, message)
		}
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

// This API endpoint will return the list of users that they will see in the chat page. Sorry for over-complicating it lol.
func MessagerListAPI(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		log.Println("MessagerListAPI: ", err)
		w.WriteHeader(http.StatusTeapot)
		return
	}

	followers, err := models.GetFollowersByUserID(session.User.UserID)
	if err != nil {
		log.Println("MessagerListAPI: Couldn't get messagers lists: ", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	followings, err := models.GetFollowingsByUserID(session.User.UserID)
	if err != nil {
		log.Println("MessagerListAPI: Couldn't get messagers lists: ", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	friends := append(followers, followings...)
	var list []models.UserModel
	for _, follow_obj := range friends {
		var otheruser uuid.UUID
		if follow_obj.UserID == session.User.UserID {
			otheruser = follow_obj.FollowerID
		} else {
			otheruser = follow_obj.UserID
		}

		if ok, err := models.IsMessaged(otheruser, session.User.UserID); !ok || err != nil {
			user, err := models.GetUserByID(otheruser)
			if err != nil {
				log.Println("MessagerListAPI: Couldn't get messagers lists: ", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			// only add the user if it doesn't already exists
			userExists := slices.ContainsFunc(list, func(u models.UserModel) bool {
				return u.UserID == otheruser
			})
			if !userExists {
				list = append(list, *user)
			}
		}
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].UserFirstName < list[j].UserFirstName
	})

	messaged, err := models.GetMessagedUsers(session.User.UserID)
	if err != nil {
		log.Println("MessagerListAPI: Couldn't get messagers lists: ", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	list = append(messaged, list...)

	w.Header().Set("Content-Type", "application/json")
	utils.EncodeJSON(w, map[string]interface{}{
		"user":     session.User,
		"response": list,
	})
}

// HandleStoreGroupMessages handles storing new messages of the group chat.
func HandleStoreGroupMessages(w http.ResponseWriter, r *http.Request) {
	// Decode the incoming message
	var message models.GroupMessage
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

	if err := message.Save(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusCreated)
}

// HandleGroupMessage handles the request for sending a message to a group.
// func HandleGroupMessage(w http.ResponseWriter, r *http.Request) {
//     var message models.GroupMessage
//     if err := json.NewDecoder(r.Body).Decode(&message); err != nil {
//         http.Error(w, err.Error(), http.StatusBadRequest)
//         return
//     }

//     message.MessageID = uuid.Must(uuid.NewV4())
//     message.MessageTime = time.Now()

//     if err := message.Save(); err != nil {
//         http.Error(w, err.Error(), http.StatusInternalServerError)
//         return
//     }

//     w.Header().Set("Content-Type", "application/json")
//     json.NewEncoder(w).Encode(message)
// }

// HandleGetGroupMessages handles the request for fetching messages of a group.
// func HandleGetGroupMessages(w http.ResponseWriter, r *http.Request) {
//     groupID := r.URL.Query().Get("group_id")
//     messages, err := models.GetMessagesByGroupID(groupID)
//     if err != nil {
//         http.Error(w, err.Error(), http.StatusInternalServerError)
//         return
//     }

//     w.Header().Set("Content-Type", "application/json")
//     json.NewEncoder(w).Encode(messages)
// }
