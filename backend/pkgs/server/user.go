package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strings"

	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"

	"github.com/gofrs/uuid"
)

/**
 * @file user.go
 * @brief This file handles the user-related HTTP requests.
 *
 * This file contains the handlers for various user-related operations such as
 * retrieving user profiles, updating user profiles, following users, and responding
 * to follow requests. Each handler function processes the HTTP request, interacts
 * with the session and model layers, and returns the appropriate JSON response.
 */

// This function checks if the user is logged in by retrieving the session cookie and verifying the session information.
// The user's profile data is retrieved based on the session information and the query parameter.
// The response is encoded as JSON and sent back to the client.
func HandleProfile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling profile")

	// Get the session cookie to check if the user is logged in
	session_id, err := r.Cookie("session_id")
	if err != nil || session_id == nil {
		log.Println("HandleProfile: Error getting session cookie", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Retrieve the user based on the session information
	session, err := pkgs.MainSessionManager.GetSession(session_id.Value)
	if err != nil || session == nil {
		log.Println("HandleProfile: Error getting session", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get the user from the session
	user := session.User

	// Retrieve user-related data based on the query parameter
	var response interface{}

	switch r.URL.Query().Get("q") {

	// Placeholder for followers
	case "followers":
		user_followers, err := models.GetFollowersByUserID(user.UserID)
		if err != nil {
			log.Println("HandleProfile: Error getting followers by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		response = user_followers

	// Placeholder for followings
	case "followings":
		user_followings, err := models.GetFollowingsByUserID(user.UserID)
		if err != nil {
			log.Println("HandleProfile: Error getting followings by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		response = user_followings

	// Placeholder for comments
	case "comments":
		user_comments, err := models.GetCommentsByUserID(user.UserID)
		if err != nil {
			log.Println("HandleProfile: Error getting comments by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		response = user_comments

	// Placeholder for posts liked
	case "post_likes":
		user_posts_likes, err := models.GetLikesByUserID(user.UserID)
		if err != nil {
			log.Println("HandleProfile: Error getting likes by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		var posts []models.PostModel

		for _, like := range user_posts_likes {
			post, err := models.GetPostByPostID(like.PostID)
			if err != nil {
				log.Println("HandleProfile: Error getting post by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			posts = append(posts, *post)
		}

		response = posts

	// Placeholder for posts liked
	case "comments_liked":
		user_posts_comments, err := models.GetLikeByUserID(user.UserID)
		if err != nil {
			log.Println("HandleProfile: Error getting comments by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		var comments []models.Comment

		for _, like := range user_posts_comments {
			comment, err := models.GetCommentByCommentID(like.CommentID)
			if err != nil {
				log.Println("HandleProfile: Error getting post by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			comments = append(comments, *comment)
		}
		response = comments

	// Placeholder for posts
	default:
		user_posts, err := models.GetPostsByAuthorID(user.UserID)
		if err != nil {
			log.Println("HandleProfile: Error getting posts by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		response = user_posts
	}

	// Serve the JSON of the user profile
	utils.EncodeJSON(w, map[string]interface{}{
		"user":     user,
		"response": response,
	})
}

// This function expects the updated profile information to be provided in the request body in JSON format.
// The updated profile information is returned in JSON format.
func HandleProfileUpdate(w http.ResponseWriter, r *http.Request) {
	// Get the session cookie to check if the user is logged in
	session_id, err := r.Cookie("session_id")
	if err != nil || session_id == nil {
		log.Println("HandleProfileUpdate: Error getting session cookie:", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Retrieve the user based on the session information
	session, err := pkgs.MainSessionManager.GetSession(session_id.Value)
	if err != nil || session == nil {
		log.Println("HandleProfileUpdate: Error getting session", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get the user from the session
	inputData := make(map[string]string)
	err = json.NewDecoder(r.Body).Decode(&inputData)
	if err != nil {
		http.Error(w, "Could not parse JSON data", http.StatusBadRequest)
		log.Print("Could not parse JSON data: ", err)
		return
	}

	// updating keys to trim and removing old ones from map
	for key := range inputData {
		trimmedKey := strings.TrimSpace(key)
		value := inputData[key]
		delete(inputData, key)
		inputData[trimmedKey] = strings.TrimSpace(value)
	}

	/*------------------------------------- IF x-www-form-urlencoded && NOT JSON, reverse comments and comment JSON parts ---------------------------------*/
	// Parse form data
	// if err := r.ParseForm(); err != nil {
	// 	http.Error(w, "Could not parse form data", http.StatusBadRequest)
	// 	log.Println("HandleProfileUpdate: Could not parse form data:", err)
	// 	return
	// }

	user := session.User
	// // writing for flexibility, as front end is not yet started
	// for key, value := range r.Form {
	// 	log.Println("HandleProfileUpdate: Received update request for ", key)
	// 	in_value := strings.TrimSpace(value[0])
	// 	if in_value != "" {
	// 		inputData[key] = in_value // assuming no input will take in a number of values
	// 	}
	// }

	// Dynamically change the values in the user through what is sent to this function
	v := reflect.ValueOf(user).Elem()
	for field, info := range inputData {
		fieldValue := v.FieldByName(field)
		if fieldValue.IsValid() && fieldValue.CanSet() {
			fieldValue.SetString(info)
		} else {
			log.Printf("HandleProfileUpdate: Unsupported field type for field %s", field)
		}
	}

	session.User.Update()

	fmt.Println("Handling profile update")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Profile updated successfully"})
}

// HandleFollow handles the HTTP request for following a user.
// It expects the user to be followed to be provided in the request body in JSON format.
// The response is returned in JSON format.
func HandleFollow(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling follow")

	session_id, err := r.Cookie("session_id")
	if err != nil || session_id == nil {
		log.Println("HandleProfileUpdate: Error getting session cookie:", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Retrieve the user based on the session information
	session, err := pkgs.MainSessionManager.GetSession(session_id.Value)
	if err != nil || session == nil {
		log.Println("HandleProfileUpdate: Error getting session", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse form data
	if err := r.ParseForm(); err != nil {
		log.Println("HandleFollow: Could not parse form data:", err)
		http.Error(w, "Could not parse form data", http.StatusBadRequest)
		return
	}

	// Convert user id to uuid type
	uid, err := uuid.FromString(r.FormValue("user_id"))
	if err != nil {
		log.Println("HandleFollow: Error converting user id to UUID:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Check if follow relationship already exists
	followercheck, err := models.GetFollowerUser(uid, session.User.UserID)
	if err == nil{
		log.Println("HandleFollow: Follower relationship already exists, Deleting follow")
		followercheck.Del()
		followingcheck, err := models.GetFollowingUser(session.User.UserID, uid)
		if err != nil {
			log.Println("HandleFollow: Error getting following user when follower exists:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		} else {
			followingcheck.Del()
		}
	}

	// Populate user_follower & user_following model
	follower := models.UserFollowerModel{
		UserID:     uid,
		FollowerID: session.User.UserID,
	}
	follower.Save()

	following := models.UserFollowingModel{
		UserID:      session.User.UserID,
		FollowingID: uid,
	}
	following.Save()

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
