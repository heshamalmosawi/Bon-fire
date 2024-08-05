package server

import (
	"encoding/json"
	"fmt"
	"net/http"
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