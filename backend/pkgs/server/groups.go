package server

import (
	"encoding/json"
	"fmt"
	"log"
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

// Groups represents a structure that holds the group model.
type Groups struct {
	group models.GroupModel
}

/**
 * This file handles the group related requests.
 */

// TODO: Implement the group functions then fix the decumentation based on the implementation.

// HandleGroup handles HTTP requests for retrieving group details based on the provided Group ID.
func HandleGroup(w http.ResponseWriter, r *http.Request) {
	// Extract the Group ID from the query parameters
	groupIDStr := r.URL.Query().Get("id")

	// Convert the string to a UUID using uuid.FromString
	groupID, err := uuid.FromString(groupIDStr)
	if err != nil {
		log.Println("HandleGroup: Invalid Group ID", err)
		http.Error(w, "Invalid Group ID", http.StatusBadRequest)
		return
	}

	// Populate the Groups struct with the GroupModel
	group := Groups{
		group: models.GroupModel{
			GroupID: groupID,
			// Populate other fields if necessary
		},
	}

	var response interface{}

	// Get group details by Group ID
	groupEvery, err := models.GetGroupByID(group.group.GroupID)
	if err != nil {
		log.Println("HandleGroup: Error getting group details", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	response = groupEvery

	// Encode the response in JSON format and send it to the client
	utils.EncodeJSON(w, map[string]interface{}{
		"group":    group,
		"response": response,
	})
}

// HandleGroupCreate handles the request for creating a new group.
func HandleGroupCreate(w http.ResponseWriter, r *http.Request) {
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

	// Extract the user ID from the session to set as the OwnerID
	ownerID := session.User.UserID

	// Extract form values for group name and description
	groupName := r.PostFormValue("group_name")
	groupDescrip := r.PostFormValue("group_descrip")

	// Generate a new GroupID
	groupID, err := uuid.NewV4()
	if err != nil {
		http.Error(w, "Failed to generate Group ID", http.StatusInternalServerError)
		return
	}

	// Create the group model with the extracted and generated values
	group := models.GroupModel{
		GroupID:      groupID,
		GroupName:    groupName,
		GroupDescrip: groupDescrip,
		OwnerID:      ownerID,
		// Additional fields can be added as needed
	}

	// Save the group to the database
	if err := models.CreateGroup(&group); err != nil {
		http.Error(w, "Failed to create group", http.StatusInternalServerError)
		return
	}

	// Respond with success and send the created Group ID back to the client
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Group created", "group_id": groupID.String()})
}

// HandleGroupInvite handles the request for inviting users to a group.
func HandleGroupInvite(w http.ResponseWriter, r *http.Request) {

	// Retrieve the session ID from the cookie
	sessionID, err := r.Cookie("session_id")
	if err != nil || sessionID == nil {
		log.Println("HandleGroupInvite: Error getting session cookie", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get the session from the session manager
	session, err := pkgs.MainSessionManager.GetSession(sessionID.Value)
	if err != nil || session == nil {
		log.Println("HandleGroupInvite: Error getting session", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract the Group ID and User ID from the form data
	groupIDStr := r.PostFormValue("group_id")
	userIDStr := r.PostFormValue("user_id")

	inviterID := session.User.UserID

	// Convert the Group ID and User ID strings to UUIDs
	groupID, err := uuid.FromString(groupIDStr)
	if err != nil {
		http.Error(w, "Invalid Group ID", http.StatusBadRequest)
		return
	}

	userID, err := uuid.FromString(userIDStr)
	if err != nil {
		http.Error(w, "Invalid User ID", http.StatusBadRequest)
		return
	}

	// Retrieve the group details by Group ID
	group, err := models.GetGroupByID(groupID)
	if err != nil || group.OwnerID != inviterID {
		http.Error(w, "Unauthorized to invite users to this group", http.StatusForbidden)
		return
	}

	// Add the user to the group
	err = models.AddUserToGroup(group, &models.UserModel{UserID: userID})
	if err != nil {
		http.Error(w, "Failed to invite user to the group", http.StatusInternalServerError)
		return
	}

	// Respond with success and confirm the user invitation to the client
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "User invited successfully"})
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

	// Extract the user ID from the session to set as the OwnerID
	ownerID := session.User.UserID

	// Extract form values for group name and description
	groupName := r.PostFormValue("group_name")
	groupDescrip := r.PostFormValue("group_descrip")

	// Generate a new GroupID
	groupID, err := uuid.NewV4()
	if err != nil {
		http.Error(w, "Failed to generate Group ID", http.StatusInternalServerError)
		return
	}

	// Create the group model with the extracted and generated values
	group := models.GroupModel{
		GroupID:      groupID,
		GroupName:    groupName,
		GroupDescrip: groupDescrip,
		OwnerID:      ownerID,
		// Additional fields can be added as needed
	}

	// Delete the group from the database
	if err := models.DeleteGroup(&group); err != nil {
		http.Error(w, "Failed to delete group", http.StatusInternalServerError)
		return
	}

	// Respond with success and confirm group deletion to the client
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Group deleted", "group_id": groupID.String()})
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
