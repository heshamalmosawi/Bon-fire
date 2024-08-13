package server

import (
	"bonfire/pkgs/models"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gofrs/uuid"
)

/**
 * This file handles the user authentication requests.
 */

// TODO: Implement the comments functions then fix the decumentation based on the implementation.

// HandleComment handles the HTTP request for retrieving a comment.
// It requires a valid comment ID to be present in the request.
func HandleComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling comment")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Comment"})
}

// HandleCreateComment handles the HTTP request for creating a comment.
func HandleCreateComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling comment creation")

	// Set the response header to JSON
	w.Header().Set("Content-Type", "application/json")

	// Parse the incoming JSON request
	var comment models.Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generate a new UUID for the comment if not provided
	if comment.CommentID == uuid.Nil {
		comment.CommentID, err = uuid.NewV4()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Save the comment to the database
	err = comment.Save()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return a success response
	json.NewEncoder(w).Encode(map[string]string{"response": "Comment created"})
}

// HandleLikeComment handles the HTTP request for liking a comment.
func HandleLikeComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling comment like")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Comment liked"})
}
