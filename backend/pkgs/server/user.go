package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	// "os"
)

/**
 * This file handles the user related requests.
 */

// TODO: Implement the user functions then fix the decumentation based on the implementation.

// HandleProfile handles the HTTP request for retrieving a user's profile.
// It requires a valid session cookie to be present in the request.
// The user's profile information, including posts, comments, likes, etc., is returned in JSON format.
func HandleProfile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling profile")

	// this line will get the section cookie so we can know if the user is logged in or not
	// those lines will be replaced by the call of the session validation function to follow the good practice needed
	sessionUser, err := r.Cookie("session_id")
	if err != nil || sessionUser == nil {
		log.Println("Error getting session cookie:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// get the user here
	// if sessionUser != nil {
	// 	  User := &models.UserModel{
	// 		UserNickname:  "xlvk",
	// 		UserFirstName: "Fatima",
	// 		UserLastName:  "El-Hajjaji",
	// 		UserAvatarPath:  imageIdToUrl(sessionUser.ImageId),
	//    }
	// }

	// get the user posts, comments, likes, etc.
	switch r.URL.Query().Get("q") {
		case "comments":
		// get comments only (TODO)
		case "likes":
		// get liked posts/comments (TODO)
		default:
		// user posts (TODO)
	}

	// the JSON of the user profile should be served at the end.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Profile"})
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