package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"github.com/gofrs/uuid"
	"bonfire/pkgs"
	"bonfire/pkgs/models"
)

// TODO: Implement the group functions then fix the decumentation based on the implementation.

// HandleGroup handles the request for group related operations.
func HandleGroup(w http.ResponseWriter, r *http.Request) {
	// Extract the group ID from the URL path
	urlParts := strings.Split(r.URL.Path, "/")
	groupIDStr := urlParts[len(urlParts)-1]

	// Convert the group ID string to a UUID
	groupID, err := uuid.FromString(groupIDStr)
	if err != nil {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	// Get the session cookie to check if the user is logged in
	sessionID, err := r.Cookie("session_id")
	var user *models.UserModel
	if err == nil && sessionID != nil {
		session, err := pkgs.MainSessionManager.GetSession(sessionID.Value)
		if err == nil {
			user = session.User
		}
	}

	// Retrieve the group information
	group, err := models.GetGroupByID(groupID)
	if err != nil || group == nil {
		http.Error(w, "Failed to retrieve group information", http.StatusInternalServerError)
		log.Println("Error retrieving group information:", err)
		return
	}

	// Check if the user is a member of the group (if logged in)
	isMember := false
	if user != nil {
		isMember, err = models.IsUserInGroup(user.UserID, groupID)
		if err != nil {
			http.Error(w, "Failed to check membership", http.StatusInternalServerError)
			log.Println("Error checking membership:", err)
			return
		}
	}

	if !isMember && user.UserID != group.OwnerID {
        // If the user is neither a member nor the owner, respond with unauthorized
        http.Error(w, "Unauthorized access", http.StatusUnauthorized)
        return
    } 
	
	isRequested := false

	// Get the total number of members in the group
	totalMembers, err := models.GetTotalMembers(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve total members", http.StatusInternalServerError)
		log.Println("Error retrieving total members:", err)
		return
	}

	// Retrieve the posts for the group
	posts, err := models.GetPostsByGroupID(groupID,user.UserID)
	if err != nil {
		http.Error(w, "Failed to retrieve group posts", http.StatusInternalServerError)
		log.Println("Error retrieving group posts:", err)
		return
	}

	groupUser, err := models.GetGroupByID(groupID)
	if err != nil {
		log.Println("HandleProfile: Error getting profile user by ID", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	} else {
		log.Println("HandleProfile: groupUser", groupUser)
	}

	// Retrieve the members of the group
	members, err := models.GetMembersByGroupID(groupID)
	if err != nil {
		http.Error(w, "Failed to retrieve group members", http.StatusInternalServerError)
		log.Println("Error retrieving group members:", err)
		return
	}

	// Prepare the response structure
	response := struct {
		GroupInfo   models.ExtendedGroupModel `json:"group_info"`
		Posts       []models.PostModel        `json:"posts"`
		Members     []models.UserModel        `json:"members"`
	}{
		GroupInfo: models.ExtendedGroupModel{
			GroupID:      group.GroupID,
			OwnerID:      group.OwnerID,
			GroupName:    group.GroupName,
			GroupDescrip: group.GroupDescrip,
			IsMember:     isMember,
			TotalMembers: totalMembers + 1,
			IsRequested:  isRequested,
			Owner: group.Owner,
		},
		Posts:   posts,
		Members: members,
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response to JSON", http.StatusInternalServerError)
		log.Println("Error encoding response to JSON:", err)
	}
}

// HandleGroupCreate handles the request for creating a new group.
func HandleGroupCreate(w http.ResponseWriter, r *http.Request) {
	fmt.Println("HIIII")
	var req GroupCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	// Check for missing or empty fields
	if req.GroupName == "" || req.GroupDescrip == "" {
		http.Error(w, "Group name and description cannot be empty", http.StatusBadRequest)
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
}

// HandleGroupDelete handles the request for deleting a group.
func HandleGroupDelete(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

