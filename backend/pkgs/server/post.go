package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"

	"github.com/gofrs/uuid"
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

		groupID = uuid.Nil
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

	// Get the current time in GMT+3
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
