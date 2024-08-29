package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gofrs/uuid"

	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
)

type GroupRequest struct {
	GroupID string `json:"group_id"`
}

type GroupJoin struct {
	GroupID string `json:"group_id"`
	UserID  string `json:"user_id"`
}

type GroupCreateRequest struct {
	GroupName    string `json:"group_name"`
	GroupDescrip string `json:"group_desc"`
}

/**
 * This file handles the group related requests.
 */

// TODO: Implement the group functions then fix the decumentation based on the implementation.

// HandleGroup handles the request for group related operations.
func HandleGroup(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupCreate handles the request for creating a new group.
func HandleGroupCreate(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HIIII")
	var req GroupCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}

	// Get the session from the session manager
	session, _ := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)

	// Extract the user ID from the session
	GroupOwner := session.User.UserID

	fmt.Println(GroupOwner)
	fmt.Println(req.GroupName)
	fmt.Println(req.GroupDescrip)
	group := models.GroupModel{
		OwnerID:      GroupOwner,
		GroupName:    req.GroupName,
		GroupDescrip: req.GroupDescrip,
	}

	if err := group.Save(); err != nil {
		http.Error(w, "Failed to create group", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	// Return a success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Group created successfully"})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupInvite handles the request for inviting users to a group.
func HandleGroupInvite(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupJoin handles the request for joining a group.
func HandleGroupJoin(w http.ResponseWriter, r *http.Request) {
	// Decode the request body to get the group ID and user ID
	var req GroupJoin
	if err := utils.DecodeJSON(r, &req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert group ID and user ID from string to UUID
	groupID, err := uuid.FromString(req.GroupID)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	userID, err := uuid.FromString(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Get the group details to ensure it exists
	group, err := models.GetGroupByID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group details", http.StatusInternalServerError)
		return
	}
	if group == nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	// Create a new GroupUser model
	groupUser := &models.GroupUser{
		UserID:  userID,
		GroupID: groupID,
	}

	// Save the user to the group_user table
	if err := groupUser.Save(); err != nil {
		http.Error(w, "Failed to join group", http.StatusInternalServerError)
		return
	}

	//create a group notification that will be displayed in chat
	notification := models.GroupNotificationModel{
		GroupID:     group.GroupID,
		NotiType:    "group_join",
		NotiContent: "User " + req.UserID + " has joined your group.",
		NotiTime:    time.Now(),
		NotiStatus:  "unread",
	}

	// Save the notification to the database
	if err := notification.Save(); err != nil {
		http.Error(w, "Failed to send notification to group admin", http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	response := map[string]string{"response": "Successfully joined the group"}
	if err := utils.EncodeJSON(w, response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func HandleGroupLeave(w http.ResponseWriter, r *http.Request) {
	// Decode the request body to get the group ID
	var req GroupRequest
	if err := utils.DecodeJSON(r, &req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	// Convert group ID from string to UUID
	groupID, err := uuid.FromString(req.GroupID)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}
	// Retrieve session ID from the cookie
	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}
	// Get the session from the session manager
	session, err := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)
	if err != nil {
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
		return
	}
	// Extract the user ID from the session
	userID := session.User.UserID
	// Get the group details to find the group owner
	group, err := models.GetGroupByID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group details", http.StatusInternalServerError)
		return
	}
	if group == nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}
	// Delete the user from the group_user table
	err = models.DeleteUserFromGroup(userID, groupID)
	if err != nil {
		http.Error(w, "Failed to leave the group", http.StatusInternalServerError)
		return
	}
	// Respond with a success message
	response := map[string]string{"response": "Successfully left the group"}
	if err := utils.EncodeJSON(w, response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// HandleGroupDelete handles the request for deleting a group.
func HandleGroupDelete(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupEventResponse handles the request for responding to a group event.
func HandleGroupEventResponse(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupRequests handles the request for managing group requests.
func HandleGroupRequests(w http.ResponseWriter, r *http.Request) {
	var req GroupRequest
	if err := utils.DecodeJSON(r, &req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert group ID from string to UUID
	groupID, err := uuid.FromString(req.GroupID)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	// Get the group info for notification
	group, err := models.GetGroupByID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group details", http.StatusInternalServerError)
		return
	}
	if group == nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}

	// Get the session for the loggedIn ID
	session, err := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)
	if err != nil {
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
		return
	}

	// get the user id
	userID := session.User.UserID

	// Create a new GroupInteractions model
	interaction := models.GroupInteractions{
		GroupID:         groupID,
		UserID:          userID,
		InteractionType: true, // might be fixed later based on how hashem interpreted
		Status:          "pending",
		InteractionTime: time.Now(),
	}

	// Save the join request to the database
	if err := interaction.Save(); err != nil {
		http.Error(w, "Failed to send join request", http.StatusInternalServerError)
		return
	}

	// Create a notification for the group owner
	notification := models.UserNotificationModel{
		ReceiverID:  group.OwnerID,
		NotiType:    "join_request",
		NotiContent: session.User.UserNickname + " has requested to join your group.", //discuss later
		NotiTime:    time.Now().Format(time.RFC3339),
		NotiStatus:  "unread",
	}

	// Save the notification to the database
	if err := notification.Save(); err != nil {
		http.Error(w, "Failed to send notification to group admin", http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	response := map[string]string{"response": "Group join request sent"}
	if err := utils.EncodeJSON(w, response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
