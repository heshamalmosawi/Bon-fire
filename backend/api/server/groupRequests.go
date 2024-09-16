package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gofrs/uuid"

	"bonfire/api/notify"
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
	Accept  bool   `json:"accept"`
}

type GroupCreateRequest struct {
	GroupName    string `json:"group_name"`
	GroupDescrip string `json:"group_desc"`
}

func HandleGroupInvite(w http.ResponseWriter, r *http.Request) {
	var req GroupJoin
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	group, err := models.ValidateAndGetGroup(req.GroupID)
	if err != nil {
		if err == models.ErrNotFound {
			http.Error(w, "Group not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	userID, err := models.ValidateUserID(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	if isMember, _ := models.IsUserInGroup(userID, group.GroupID); isMember {
		http.Error(w, "User is already a member of the group", http.StatusConflict)
		return
	}

	interaction := models.GroupInteractions{
		GroupID:         group.GroupID,
		UserID:          userID,
		InteractionType: false,
		Status:          "pending",
		InteractionTime: time.Now(),
	}

	if err := interaction.Save(); err != nil {
		http.Error(w, "Failed to save group interaction", http.StatusInternalServerError)
		return
	}

	notification := models.NotificationModel{
		ReceiverID:  userID,
		GroupID:     group.GroupID,
		NotiType:    "group_invite",
		NotiContent: fmt.Sprintf("You have been invited to join %s!", group.GroupName),
		NotiTime:    time.Now(),
		NotiStatus:  "unread",
	}

	if err := notification.Save(); err != nil {
		http.Error(w, "Failed to send invitation notification", http.StatusInternalServerError)
		return
	}

	if err := notify.NotifyUser(userID, notification); err != nil {
		log.Println("the invited user is not online")
	}

	utils.EncodeJSON(w, map[string]string{"message": "User invited successfully"})
}

func HandleGroupJoin(w http.ResponseWriter, r *http.Request) {
	var req GroupJoin
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	group, err := models.ValidateAndGetGroup(req.GroupID)
	if err != nil {
		if err == models.ErrNotFound {
			http.Error(w, "Group not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	userID, err := models.ValidateUserID(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	if err := models.DeleteGroupInteraction(group.GroupID, userID); err != nil {
		http.Error(w, "Failed to clean up group interaction", http.StatusInternalServerError)
		return
	}

	if req.Accept {
		if isMember, err := models.IsUserMemberOfGroup(userID, group.GroupID); err != nil || isMember {
			if err != nil {
				http.Error(w, "Failed to check group membership", http.StatusInternalServerError)
			} else {
				http.Error(w, "User is already a member of the group", http.StatusConflict)
			}
			return
		}

		groupUser := models.GroupUser{
			UserID:  userID,
			GroupID: group.GroupID,
		}
		if err := groupUser.Save(); err != nil {
			http.Error(w, "Failed to join group", http.StatusInternalServerError)
			return
		}

		members, err := models.GetGroupMembers(group.GroupID)
		if err != nil {
			http.Error(w, "Failed to get group members", http.StatusInternalServerError)
			return
		}

		parsedGroupMember, err := models.GetUserByID(userID)
		if err != nil {
			http.Error(w, "Failed to get new group member", http.StatusInternalServerError)
			return
		}

		for _, member := range members {
			notification := models.NotificationModel{
				GroupID:     group.GroupID,
				ReceiverID:  member.UserID,
				NotiType:    "group_join",
				NotiContent: fmt.Sprintf("%s %s has joined %s!", parsedGroupMember.UserFirstName, parsedGroupMember.UserLastName, group.GroupName),
				NotiTime:    time.Now(),
				NotiStatus:  "unread",
			}

			if err := notification.Save(); err != nil {
				http.Error(w, "Failed to save notification", http.StatusInternalServerError)
				return
			}

			notify.NotifyUser(member.UserID, notification)
		}

		utils.EncodeJSON(w, map[string]string{"response": "Successfully joined the group"})
	} else {
		utils.EncodeJSON(w, map[string]string{"response": "Join request declined"})
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
	notification := models.NotificationModel{
		ReceiverID:  group.OwnerID,
		UserID:      session.User.UserID,
		GroupID:     group.GroupID,
		NotiType:    "join_request",
		NotiContent: fmt.Sprintf("%s %s has requested to join %s", session.User.UserFirstName, session.User.UserLastName, group.GroupName), //discuss later
		NotiTime:    time.Now(),
		NotiStatus:  "unread",
	}

	// Save the notification to the database
	if err := notification.Save(); err != nil {
		http.Error(w, "Failed to send notification to group admin", http.StatusInternalServerError)
		return
	}

	if err := notify.NotifyUser(group.OwnerID, notification); err != nil {
		log.Println("the group owner is not online")
	}

	// Respond with a success message
	response := map[string]string{"response": "Group join request sent"}
	if err := utils.EncodeJSON(w, response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
