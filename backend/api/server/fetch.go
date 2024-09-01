package server

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"github.com/gofrs/uuid"
)

// FetchGroups handles the request for fetching all groups.
func FetchGroups(w http.ResponseWriter, r *http.Request) {
	// Get the session cookie to check if the user is logged in
	session_id, err := r.Cookie("session_id")
	var user *models.UserModel

	// Check if there is a session and retrieve the user information
	if err == nil && session_id != nil {
		session, err1 := pkgs.MainSessionManager.GetSession(session_id.Value)
		if err1 == nil {
			user = session.User
		}
	}

	var groups []models.ExtendedGroupModel
	if user != nil {
		// If the user is logged in, fetch groups with membership information
		groups, err = models.GetGroupsExtended(user.UserID)
		if err != nil {
			http.Error(w, "Failed to fetch groups with membership info", http.StatusInternalServerError)
			log.Println("Error fetching groups with membership info:", err)
			return
		}
	} else {
		// If no session or user is not logged in, fetch groups normally
		allGroups, err := models.GetAllGroups()
		if err != nil {
			http.Error(w, "Failed to fetch groups", http.StatusInternalServerError)
			log.Println("Error fetching groups:", err)
			return
		}
		totalMembers :=0
		// Convert to GroupResponseModel for consistency in the response
		for _, group := range allGroups {
			totalMembers,err = models.GetTotalMembers(group.GroupID)
			if err != nil {
				http.Error(w, "Failed to fetch group members", http.StatusInternalServerError)
			}
			groups = append(groups, models.ExtendedGroupModel{
				GroupID:      group.GroupID,
				OwnerID:      group.OwnerID,
				GroupName:    group.GroupName,
				GroupDescrip: group.GroupDescrip,
				IsMember:     false,        // Not applicable when the user is not logged in
				TotalMembers: totalMembers + 1,            // Not calculating total members in this case
			})
		}
	}

	// Return the groups as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(groups); err != nil {
		http.Error(w, "Failed to encode groups to JSON", http.StatusInternalServerError)
		log.Println("Error encoding groups to JSON:", err)
	}
}

// HandleFetchGroupRequests handles the request for fetching all group join requests for a specific group.
func HandleFetchGroupRequests(w http.ResponseWriter, r *http.Request) {
	// Extract the group ID from the URL path

	urlParts := strings.Split(r.URL.Path, "/")
	groupIDStr := urlParts[len(urlParts)-1]

	// Convert the group ID string to a UUID
	groupID, err := uuid.FromString(groupIDStr)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	// Retrieve all pending join requests for the group
	requests, err := models.GetPendingRequestsByGroupID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group join requests", http.StatusInternalServerError)
		log.Println("Error retrieving group join requests:", err)
		return
	}

	// Return the requests as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(requests); err != nil {
		http.Error(w, "Failed to encode response to JSON", http.StatusInternalServerError)
		log.Println("Error encoding response to JSON:", err)
	}
}
