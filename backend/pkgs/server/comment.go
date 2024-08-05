package server

import (
	"encoding/json"
	"fmt"
	"net/http"
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
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Comment created"})
}

// HandleLikeComment handles the HTTP request for liking a comment.
func HandleLikeComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling comment like")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Comment liked"})
}