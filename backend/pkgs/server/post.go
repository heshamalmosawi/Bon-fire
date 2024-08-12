package server

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

/**
 * This file handles the post requests.
 */

//  TODO: Implement the post functions then fix the decumentation based on the implementation.

// HandlePosts handles the HTTP request for retrieving a post.
// It requires a valid post ID to be present in the request.
func HandlePosts(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling post")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Post"})
}

// HandleCreatePosts handles the HTTP request for creating a post.
func HandleCreatePosts(w http.ResponseWriter, r *http.Request) {
	// Retrieve session ID from the cookie
	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}

	// Get the session from the session manager
	session, _ := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)

	// Extract the user ID from the session
	authorID := session.User.UserID

	// Assume group_id is optional and can be nil
	groupIDStr := r.PostFormValue("group_id")
	var groupID uuid.UUID
	if groupIDStr != "" {
		groupUUID, err := uuid.FromString(groupIDStr)
		if err != nil {
			http.Error(w, "Invalid group ID", http.StatusBadRequest)
			return
		}
		groupID = groupUUID
	} else {
		
		groupID =  uuid.Nil
	}

	// Extract other form values
	postContent := r.PostFormValue("post_content")
	postImagePath := r.PostFormValue("post_image_path")
	postExposure := r.PostFormValue("post_exposure")

	// Create a new post model instance
	postID, err := uuid.NewV4()
	if err != nil {
		http.Error(w, "Failed to generate post ID", http.StatusInternalServerError)
		return
	}

	location, _ := time.LoadLocation("Etc/GMT-3")
	createdAt := time.Now().In(location).Format(time.RFC3339)

	post := models.PostModel{
		PostID:        postID,
		PostContent:   postContent,
		PostImagePath: postImagePath,
		PostExposure:  postExposure,
		GroupID:       groupID,
		PostLikeCount: 0,
		CreatedAt:     createdAt,
		AuthorID:      authorID,
	}

	// Save the post to the database
	if err := post.Save(); err != nil {
		http.Error(w, "Failed to save post", http.StatusInternalServerError)
		return
	}

	// Respond with a success message
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Post created", "post_id": postID.String()})
}

// HandleLikePost handles the HTTP request for liking a post.
func HandleLikePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling post like")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Post liked"})
}