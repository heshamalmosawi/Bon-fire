package server

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gofrs/uuid"
)

// FetchGroups handles the request for fetching all groups.
func FetchGroups(w http.ResponseWriter, r *http.Request) {
	// Get the session cookie to check if the user is logged in
	var user *models.UserModel
	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}

	// Get the session from the session manager
	session, err := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)
	if err != nil {
		http.Error(w, "Invalid session detected", http.StatusUnauthorized)
		return
	}
	// Extract the user ID from the session
	user = session.User

	fmt.Println(user)
	var groups []models.ExtendedGroupModel
	if user != nil {
		// If the user is logged in, fetch groups with membership information
		fmt.Println("fetching groups user is logged in")
		groups, err = models.GetGroupsExtended(user.UserID)
		if err != nil {
			http.Error(w, "Failed to fetch groups with membership info", http.StatusInternalServerError)
			log.Println("Error fetching groups with membership info:", err)
			return
		}
	} else {
		fmt.Println("fetching groups user is logged out")
		// If no session or user is not logged in, fetch groups normally
		allGroups, err := models.GetAllGroups()
		if err != nil {
			http.Error(w, "Failed to fetch groups", http.StatusInternalServerError)
			log.Println("Error fetching groups:", err)
			return
		}
		totalMembers := 0
		// Convert to GroupResponseModel for consistency in the response
		for _, group := range allGroups {
			totalMembers, err = models.GetTotalMembers(group.GroupID)
			if err != nil {
				http.Error(w, "Failed to fetch group members", http.StatusInternalServerError)
			}
			groups = append(groups, models.ExtendedGroupModel{
				GroupID:      group.GroupID,
				OwnerID:      group.OwnerID,
				GroupName:    group.GroupName,
				GroupDescrip: group.GroupDescrip,
				IsMember:     false,            // Not applicable when the user is not logged in
				TotalMembers: totalMembers + 1, // Not calculating total members in this case
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

	// Log the fetched requests for debugging
	log.Printf("Fetched %d requests for group ID %s\n", len(requests), groupID.String())
	log.Printf("Requests: %+v\n", requests) // Log the actual requests

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(requests); err != nil {
		http.Error(w, "Failed to encode response to JSON", http.StatusInternalServerError)
		log.Println("Error encoding response to JSON:", err)
	}
}

func HandleFetchUsersNotInGroup(w http.ResponseWriter, r *http.Request) {
	urlParts := strings.Split(r.URL.Path, "/")
	groupIDStr := urlParts[len(urlParts)-1]

	groupID, err := uuid.FromString(groupIDStr)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	// Fetch the group to get the owner's ID
	group, err := models.GetGroupByID(groupID)
	if err != nil {
		http.Error(w, "Failed to fetch group", http.StatusBadRequest)
		return
	}

	// Fetch users not in the group
	users, err := models.GetUsersNotInGroup(groupID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch users not in group: %v", err), http.StatusInternalServerError)
		return
	}

	for i, user := range users {
        invited, err := models.IsUserInvited(groupID, user.UserID)
        if err != nil {
            log.Printf("Error checking invitation status for user %s: %v", user.UserID, err)
            continue // Optionally handle this more gracefully
        }
        users[i].IsInvited = invited
    }
	
	// Filter out the group owner from the list
	filteredUsers := []models.UserModel{}
	for _, user := range users {
		if user.UserID != group.OwnerID {
			filteredUsers = append(filteredUsers, user)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(filteredUsers); err != nil {
		http.Error(w, "Failed to encode users to JSON", http.StatusInternalServerError)
		log.Println("Error encoding users to JSON:", err)
	}
}
