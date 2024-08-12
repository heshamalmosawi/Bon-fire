package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gofrs/uuid"

	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	// "bonfire/pkgs/models"
)

/**
 * This file handles the post requests.
 */

//  TODO: Implement the post functions then fix the decumentation based on the implementation.

// HandlePosts handles the HTTP request for retrieving a post.
// It requires a valid post ID to be present in the request.
func HandlePosts(w http.ResponseWriter, r *http.Request) {

	groupIDStr := r.URL.Query().Get("group_id")
	
	// Get the session cookie to check if the user is logged in
	session_id, err1 := r.Cookie("session_id")
	var session *pkgs.Session
	var err2 error
	err2 = nil

	if err1 == nil && session_id != nil {
		// Retrieve the user based on the session information
		session, err2 = pkgs.MainSessionManager.GetSession(session_id.Value)
	}

	var posts []models.PostModel
	var err error

	if groupIDStr != "" {
		groupID, err := uuid.FromString(groupIDStr)
		if err != nil {
			http.Error(w, "Invalid group ID", http.StatusBadRequest)
			return
		}
		posts, err = models.GetPostsByGroupID(groupID)
	} else if session != nil && err2 == nil {

		// Get the user from the session
		user := session.User
		posts, err = models.GetViewablePosts(user.UserID)
		if err != nil {
			http.Error(w, "Error retrieving posts", http.StatusInternalServerError)
			return
		}

	} else {
		posts, err = models.GetAllPostsForNonLoggedInUsers()
		if err != nil {
			http.Error(w, "Error retrieving posts", http.StatusInternalServerError)
			return
		}
	}
	if err != nil {
		http.Error(w, "Error retrieving posts", http.StatusInternalServerError)
		return
	}

	utils.EncodeJSON(w, map[string]interface{}{
		"posts": posts,
	})
}

// HandleCreatePosts handles the HTTP request for creating a post.
func HandleCreatePosts(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling post creation")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Post created"})
}

// HandleLikePost handles the HTTP request for liking a post.
func HandleLikePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling post like")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Post liked"})
}
