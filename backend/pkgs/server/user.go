package server

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	// "net/url"
	"reflect"
	"strings"
	"time"

	"github.com/gofrs/uuid"

	"bonfire/api/middleware"
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
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
	// if err != nil || session_id == nil {
	// 	log.Println("HandleProfile: Error getting session cookie", err)
	// 	http.Error(w, "Unauthorized", http.StatusUnauthorized)
	// 	return
	// }

	var user *models.UserModel
	// Retrieve the user based on the session information
	if err == nil || session_id != nil {
		session, err1 := pkgs.MainSessionManager.GetSession(session_id.Value)
		if err1 == nil {
			user = session.User
		}

	}
	// if err != nil || session == nil {
	// 	log.Println("HandleProfile: Error getting session", err)
	// 	http.Error(w, "Unauthorized", http.StatusUnauthorized)
	// 	return
	// }

	theUrl := r.URL.Path

	log.Println("HandleProfile: theUrl", theUrl)

	urlParts := strings.Split(theUrl, "/")
	if len(urlParts) < 4 || urlParts[3] == "" {
		urlParts = append(urlParts, "posts")
	}

	// Retrieve the profile user based on the query parameter
	profileUserID := urlParts[2]

	// if no profile user id is provided, use the session user id
	var profileUserIDUUID uuid.UUID
	if profileUserID == "" {
		log.Println("HandleProfile: No profile user ID provided")
		http.Error(w, "HandleProfile: Cannot get user profile", http.StatusBadRequest)
		return
	} else {
		// get the profile user uuid
		profileUserIDUUID, err = uuid.FromString(profileUserID)
		if err != nil {
			log.Println("the user id:", profileUserID)
			log.Println("HandleProfile: Error converting profileUserID to UUID", err, profileUserID)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
	}

	profileUser, err := models.GetUserByID(profileUserIDUUID)
	if err != nil {
		log.Println("HandleProfile: Error getting profile user by ID", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	} else {
		log.Println("HandleProfile: profileUser", profileUser)
	}

	// Check if the profile is private
	if profileUser.ProfileExposure == "private" && user != nil {
		// Check if the session user is one of the profile's followers
		isFollower, err := models.IsFollower(user.UserID, profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error checking if user is a follower", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		if !isFollower {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
	} else if profileUser.ProfileExposure == "private" && user == nil {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	// Retrieve user-related data based on the query parameter
	var response interface{}

	switch r.URL.Query().Get("q") {

	// Placeholder for followers
	case "followers":
		user_followers, err := models.GetFollowersByUserID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting followers by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		response = user_followers

	// Placeholder for followings
	case "followings":
		user_followings, err := models.GetFollowingsByUserID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting followings by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		response = user_followings

	// Placeholder for comments
	case "comments":
		user_comments, err := models.GetCommentsByUserID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting comments by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		response = user_comments

	// Placeholder for posts liked
	case "post_likes":
		user_posts_likes, err := models.GetPostLikesByUserID(profileUserIDUUID)
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
		user_posts_comments, err := models.GetCommentLikeByUserID(profileUserIDUUID)
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
		user_posts, err := models.GetPostsByAuthorID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting posts by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		response = user_posts
	}

	// Serve the JSON of the user profile
	utils.EncodeJSON(w, map[string]interface{}{
		"user":     profileUser,
		"response": response,
	})
}

// This function expects the updated profile information to be provided in the request body in JSON format.
// The updated profile information is returned in JSON format.
func HandleProfileUpdate(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling profile update")
	session, err := middleware.Auth(r)
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

	user := session.User

	// Dynamically change the values in the user through what is sent to this function
	v := reflect.ValueOf(user).Elem()
	for field, info := range inputData {
		if  strings.TrimSpace(info) == "" {
			continue // no need to update empty fields.
		}
		fieldValue := v.FieldByName(field)
		if fieldValue.IsValid() && fieldValue.CanSet() {
			fieldValue.SetString(info)
		} else {
			log.Printf("HandleProfileUpdate: Unsupported field type for field %s", field)
		}
	}

	session.User.Update()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Profile updated successfully"})
}

// HandleFollow handles the HTTP request for following a user.
// It expects the user to be followed to be provided in the request body in JSON format.
// The response is returned in JSON format.
func HandleFollow(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling follow")

	// Authenticate the user
	session, err := middleware.Auth(r)
	if err != nil {
		log.Println("HandleFollow: Error authenticating user:", err)
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
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
		log.Println("HandleFollow: Error converting user id to UUID:", err, r.FormValue("user_id"))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	if uid == session.User.UserID {
		log.Println("HandleFollow: Cannot follow yourself")
		http.Error(w, "Cannot follow yourself", http.StatusBadRequest)
		return
	}
	// Check if follow  already exists, delete if it does
	followingcheck, err := models.GetFollowingUser(session.User.UserID, uid)
	if err == nil && followingcheck.UserID != uuid.Nil {
		followingcheck.Del()
		log.Println("HandleFollow: Unfollowed user")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"response": "Unfollow"})
		return
	} else if err != sql.ErrNoRows {
		log.Println("HandleFollow: Error getting following user:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	user, err := models.GetUserByID(uid)
	if err != nil {
		log.Println("HandleFollow: Error getting user to follow by ID:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	noti, notiType, resp := "", "", ""
	// if user is private, send follow request
	if user.ProfileExposure != "Public" {

		// check if follow request already exists
		followrequestcheck, err := models.GetPendingRequest(uid, session.User.UserID)
		if followrequestcheck.RequestID != uuid.Nil {
			log.Println("HandleFollow: Follow request already exists")
			http.Error(w, "Follow Request Already Exists", http.StatusBadRequest)
			return
		} else if err != nil && err != sql.ErrNoRows {
			log.Println("HandleFollow: Error getting follow request:", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		followrequest := models.FollowRequestModel{
			RequestID:     uuid.Must(uuid.NewV4()),
			UserID:        uid,
			RequesterID:   session.User.UserID,
			RequestStatus: "pending",
		}
		followrequest.Save()
		noti = session.User.UserNickname + " has requested to follow your account!"
		notiType = "follow_request"
		resp = "Follow Request Sent"
	} else {
		// Populate user_follow model
		follow := models.UserFollowModel{
			UserID:     uid,
			FollowerID: session.User.UserID,
		}
		follow.Save()
		noti = session.User.UserNickname + " has followed your account!"
		notiType = "follow"
		resp = "Follow"
	}

	notification := models.UserNotificationModel{
		ReceiverID:  uid,
		NotiType:    notiType,
		NotiContent: noti,
		NotiTime:    time.Now().Format(time.RFC3339),
		NotiStatus:  "unread",
	}
	if err := notification.Save(); err != nil {
		log.Println("HandleFollow: Error saving notification:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": resp})
}

// HandleFollowRequest handles the HTTP request for responding to a follow request.
// It expects the follow request to be responded to be provided in the request body in JSON format.
// The response is returned in JSON format.
func HandleFollowRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling follow response")

	// Authenticate the user
	_, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
		return
	}

	// Get data from the request body
	var followreq_response models.FollowRequestModel
	err = json.NewDecoder(r.Body).Decode(&followreq_response)
	if err != nil {
		http.Error(w, "Could not parse JSON data", http.StatusBadRequest)
		log.Print("Could not parse JSON data: ", err)
		return
	}

	// Get the follow request from the database
	followreq, err := models.GetPendingRequest(followreq_response.UserID, followreq_response.RequesterID)
	if err != nil {
		log.Println("HandleFollowResponse: Error getting follow request by ID", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// if it is not pending then no need to respond!
	if followreq.RequestStatus != "pending" {
		log.Println("HandleFollowResponse: Follow request is not pending")
		http.Error(w, "Follow request is not pending", http.StatusBadRequest)
		return
	}

	if followreq_response.RequestStatus == "accept" {
		// Populate user_follow model
		follow := models.UserFollowModel{
			UserID:     followreq.UserID,
			FollowerID: followreq.RequesterID,
		}
		follow.Save()

		// Update the follow request
		followreq.RequestStatus = "accept"
		followreq.Update()

		// Send notification to the user who sent the follow request
		notification := models.UserNotificationModel{
			ReceiverID:  followreq.RequesterID,
			NotiType:    "follow_response",
			NotiContent: followreq.UserID.String() + " has accepted your follow request!",
			NotiTime:    time.Now().Format(time.RFC3339),
			NotiStatus:  "unread",
		}
		notification.Save()

		// Send notification to the user who sent the follow request
		notification = models.UserNotificationModel{
			ReceiverID:  followreq.UserID,
			NotiType:    "follow",
			NotiContent: followreq.UserID.String() + " has followed your account!",
			NotiTime:    time.Now().Format(time.RFC3339),
			NotiStatus:  "unread",
		}
		notification.Save()
	} else {
		// Update the follow request
		followreq.RequestStatus = "reject"
		followreq.Update()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Follow Response"})
}

// HandlePeople handles the HTTP request for retrieving a all the users
func HandlePeople(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling people")

	// Authenticate the user
	_, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
		return
	}

	// Get all the users
	users, err := models.GetAllUsers()
	if err != nil {
		log.Println("HandlePeople: Error getting all users", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
