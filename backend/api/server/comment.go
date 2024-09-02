package server

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gofrs/uuid"

	"bonfire/api/middleware"
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
)

/**
 * This file handles the comments API endpoints.
 * It includes structures and methods for creating, managing, and displaying comments.
 which includes:
	- HandleComment: to retrieve a all the comments for a post
	- HandleCreateComment: to create a comment
	- HandleLikeComment: to like a comment and update the like count
*/

// HandleComment handles the HTTP request for retrieving a comment.
func HandleComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling comment retrieval")

	// Set the response header to JSON
	w.Header().Set("Content-Type", "application/json")

	// Extract the comment ID from the request
	postIDStr := r.PathValue("id")
	if postIDStr == "" {
		http.Error(w, "post_id is required", http.StatusBadRequest)
		return
	}

	session, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, "error getting session", http.StatusBadRequest)
		return
	} else if session == nil {
		http.Error(w, "session not found", http.StatusUnauthorized)
		return
	}

	// Parse the comment ID
	postID, err := uuid.FromString(postIDStr)
	if err != nil {
		http.Error(w, "invalid post_id", http.StatusBadRequest)
		return
	}

	// Retrieve the comment from the database
	comments, err := models.GetCommentsByPostID(postID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for i, v := range comments {
		v.IsLiked, err = models.GetIsCommentLiked(v.CommentID, session.User.UserID)
		if err != nil {
			http.Error(w, "Error retrieving post isLiked", http.StatusInternalServerError)
			return
		}

		comments[i] = v
	}

	// Return the comment as JSON
	utils.EncodeJSON(w, map[string]interface{}{
		"message":  "Comment retrieved successfully",
		"comments": comments,
	})
}

// HandleCreateComment handles the HTTP request for creating a comment.
func HandleCreateComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling comment creation")

	session, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Set the response header to JSON
	w.Header().Set("Content-Type", "application/json")

	// Parse the incoming JSON request
	var comment models.Comment
	err = json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	comment.AuthorID = session.User.UserID

	// Generate a new UUID for the comment if not provided
	if comment.CommentID == uuid.Nil {
		comment.CommentID, err = uuid.NewV4()
		if err != nil {
			fmt.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Save the comment to the database
	err = comment.Save()
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return a success response
	utils.EncodeJSON(w, map[string]interface{}{"response": "Comment created"})
}

// HandleLikeComment handles the HTTP request for liking a comment.
func HandleLikeComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extract comment ID and user ID from the request
	// commentIDStr := r.URL.Query().Get("comment_id")
	// userIDStr := r.URL.Query().Get("user_id")
	commentIDStr := r.PathValue("id")

	if commentIDStr == "" {
		http.Error(w, "Missing comment_id or user_id", http.StatusBadRequest)
		return
	}

	// Parse the comment ID
	commentID, err := uuid.FromString(commentIDStr)
	if err != nil {
		http.Error(w, "Invalid comment_id", http.StatusBadRequest)
		return
	}

	// Extract session ID from cookies
	sessionCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Missing session_id cookie", http.StatusUnauthorized)
		return
	}

	// Retrieve the session
	session, err := pkgs.MainSessionManager.GetSession(sessionCookie.Value)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	// Get the user from the session
	user := session.User

	// Toggle the like status for the comment
	err = models.ToggleCommentLike(commentID, user.UserID)
	if err != nil {
		http.Error(w, "Failed to toggle comment like", http.StatusInternalServerError)
		return
	}

	// Get the updated like count for the comment
	likeCount, err := models.GetCommentLikeCount(commentID)
	if err != nil {
		http.Error(w, "Error getting comment like count", http.StatusInternalServerError)
		return
	}

	// Get the comment
	comment, err := models.GetCommentByCommentID(commentID)
	if err != nil || comment == nil {
		http.Error(w, "Error getting comment", http.StatusInternalServerError)
		return
	}

	// Update the comment with the like count
	comment.CommentLikeCount = likeCount
	comment.Update()

	// Return a success response
	utils.EncodeJSON(w, map[string]interface{}{
		"message":    "Comment liked successfully",
		"like_count": likeCount,
	})
}
