package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"bonfire/pkgs"
)

/**
 * This file handles the user related requests.
 */

// TODO: Implement the user functions then fix the decumentation based on the implementation.

// HandleProfile handles the HTTP request for retrieving a user's profile.
// It requires a valid session cookie to be present in the request.
// The user's profile information, including posts, comments, likes, etc., is returned in JSON format.

var sessionManager = pkgs.NewSessionManager(time.Hour * 24)

func HandleProfile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling profile")

	// Get the session cookie to check if the user is logged in
	session_id, err := r.Cookie("session_id")
	if err != nil || session_id == nil {
		log.Println("Error getting session cookie:", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Retrieve the user based on the session information
	session, err := sessionManager.GetSession(session_id.Value)
	if err != nil || session == nil {
		log.Println("Error getting session:", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user := session.User

	// Retrieve user-related data based on the query parameter
	var response interface{}
	switch r.URL.Query().Get("q") {
	// we don't have any comments models in the database?.
	// case "comments":
	// 	// Retrieve user comments (TODO)
		// response = []string{} // Placeholder for comments
	case "likes":
		// Retrieve liked posts/comments (TODO)
		response = []string{} // Placeholder for likes
	default:
		// Retrieve user posts (TODO)
		response = []string{} // Placeholder for posts
	}

	// Serve the JSON of the user profile
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":     user,
		"response": response,
	})
}

// HandleProfileUpdate handles the HTTP request for updating a user's profile.
// It expects the updated profile information to be provided in the request body in JSON format.
// The updated profile information is returned in JSON format.
func HandleProfileUpdate(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling profile update")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Profile Update"})
}

// HandleFollow handles the HTTP request for following a user.
// It expects the user to be followed to be provided in the request body in JSON format.
// The response is returned in JSON format.
func HandleFollow(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling follow")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Follow"})
}

// HandleFollowResponse handles the HTTP request for responding to a follow request.
// It expects the follow request to be responded to be provided in the request body in JSON format.
// The response is returned in JSON format.
func HandleFollowResponse(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling follow response")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Follow Response"})
}
