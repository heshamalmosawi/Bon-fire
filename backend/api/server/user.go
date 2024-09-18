package server

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strings"
	"time"

	"github.com/gofrs/uuid"

	"bonfire/api/middleware"
	"bonfire/api/notify"
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

	// Authenticating user
	session_id, err := middleware.Auth(r)
	if err != nil {
		log.Println("HandleProfile: Error getting session cookie", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	theUrl := r.URL.Path

	urlParts := strings.Split(theUrl, "/")
	if len(urlParts) < 3 || urlParts[2] == "" {
		log.Println("HandleProfile: No profile user ID provided")
		http.Error(w, "HandleProfile: Cannot get user profile", http.StatusBadRequest)
		return
	}

	// Retrieve the profile user based on the query parameter
	profileUserID := urlParts[2]

	// if no profile user id is provided, use the session user id
	var profileUserIDUUID uuid.UUID
	var err1 error
	if profileUserID == "" {
		log.Println("HandleProfile: No profile user ID provided")
		http.Error(w, "HandleProfile: Cannot get user profile", http.StatusBadRequest)
		return
	} else {
		// get the profile user uuid
		profileUserIDUUID, err1 = uuid.FromString(profileUserID)
		if err1 != nil {
			log.Println("the user id:", profileUserID)
			log.Println("HandleProfile: Error converting profileUserID to UUID", err, profileUserID)
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}
	}

	profileUser, err3 := models.GetUserByID(profileUserIDUUID)
	if err3 != nil {
		log.Println("HandleProfile: Error getting profile user by ID", err)
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	} else {
		log.Println("HandleProfile: profileUser", profileUser)
	}

	var user *models.UserModel
	// Retrieve the user based on the session information
	if session_id != nil {
		session, err1 := pkgs.MainSessionManager.GetSession(session_id.ID)
		if err1 == nil {
			user = session.User
			followrequestcheck, err := models.GetPendingRequest(profileUserIDUUID, user.UserID)
			if err != nil {
				log.Println("HandleProfile: Error getting follow request:", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			if followrequestcheck.RequestID != uuid.Nil {
				profileUser.IsReuested = true
				log.Println("HandleProfile: profileUser, update", profileUser)
			} else {
				log.Println("HandleProfile: profileUser, no update", profileUser)
			}
		}
	}

	// Check if the profile is private
	if profileUser.ProfileExposure == "Private" && user != nil {
		// Check if the session user is one of the profile's followers
		isFollower, err := models.IsFollower(profileUserIDUUID, user.UserID)
		if err != nil {
			log.Println("HandleProfile: Error checking if user is a follower", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		profileUser.IsFollowed = isFollower
		if !isFollower && user.UserID != profileUser.UserID {
			w.WriteHeader(http.StatusForbidden)
			utils.EncodeJSON(w, map[string]interface{}{
				"user":     profileUser,
				"response": "Private",
			})
			return
		}
	} else if profileUser.ProfileExposure == "Private" && user == nil {
		w.WriteHeader(http.StatusForbidden)
		utils.EncodeJSON(w, map[string]interface{}{
			"user":     profileUser,
			"response": "Private",
		})
		return
	}

	// Retrieve user-related data based on the query parameter
	var response any

	type PostWithAuthor struct {
		Post   *models.PostModel
		Author *models.UserModel
	}

	switch r.URL.Query().Get("q") {

	// Placeholder for followers
	case "followers":
		user_followers, err := models.GetFollowersByUserID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting followers by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		var followers []models.UserModel
		for _, follower := range user_followers {
			userf, err := models.GetUserByID(follower.FollowerID)
			if err != nil {
				log.Println("HandleProfile: Error getting user by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			if user != nil {
				isFollowing, err := models.IsFollowing(user.UserID, userf.UserID)
				if err != nil {
					log.Println("HandleProfile: Error checking if user is a follower", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}

				isReusted, err := models.GetPendingRequest(userf.UserID, user.UserID)
				if err != nil {
					log.Println("HandleProfile: Error getting follow request:", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}
				if isReusted.RequestID != uuid.Nil {
					userf.IsReuested = true
				}
				userf.IsFollowed = isFollowing
			}
			followers = append(followers, *userf)
		}
		response = followers

	// Placeholder for followings
	case "followings":
		user_followings, err := models.GetFollowingsByUserID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting followings by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		var followings []models.UserModel
		for _, following := range user_followings {
			userf, err := models.GetUserByID(following.FollowerID)
			if err != nil {
				log.Println("HandleProfile: Error getting user by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			if user != nil {
				isFollowing, err := models.IsFollowing(user.UserID, userf.UserID)
				if err != nil {
					log.Println("HandleProfile: Error checking if user is a follower", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}

				isReusted, err := models.GetPendingRequest(userf.UserID, user.UserID)
				if err != nil {
					log.Println("HandleProfile: Error getting follow request:", err)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}
				if isReusted.RequestID != uuid.Nil {
					userf.IsReuested = true
				}
				userf.IsFollowed = isFollowing
			}
			followings = append(followings, *userf)
		}
		response = followings

	// Placeholder for comments
	case "comments":
		user_comments, err := models.GetCommentsByUserID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting comments by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		var posts []PostWithAuthor
		for _, comment := range user_comments {
			post, err := models.GetPostByPostID(comment.PostID)
			if err != nil {
				log.Println("HandleProfile: Error getting post by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			// Check if the post already exists, remove the old one so it is a unique and ordered list.
			for i, existingPost := range posts {
				if existingPost.Post.PostID == post.PostID {
					posts = append(posts[:i], posts[i+1:]...)
					break
				}
			}
			author, err := models.GetUserByID(post.AuthorID)
			if err != nil {
				log.Println("HandleProfile: Error getting user by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			post.Comments, err = models.GetCommentsByPostID(post.PostID)
			if err != nil {
				log.Println("HandleProfile: Error getting comments by post ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			post.IsLiked, err = models.GetIsPostLiked(post.PostID, profileUserIDUUID)
			if err != nil {
				log.Println("HandleProfile: Error getting likes by post ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			pa := PostWithAuthor{Post: post, Author: author}
			posts = append(posts, pa)
		}
		// print posts in blue
		log.Println("\033[34m", posts, "\033[0m")
		response = posts

	// Placeholder for posts liked
	case "likes":
		user_posts_likes, err := models.GetPostLikesByUserID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting likes by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		var posts []PostWithAuthor

		for _, like := range user_posts_likes {
			if like.PostID == uuid.Nil {
				continue
			}
			post, err := models.GetPostByPostID(like.PostID)
			if err != nil {
				log.Println("HandleProfile: Error getting post by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			author, err := models.GetUserByID(post.AuthorID)
			if err != nil {
				log.Println("HandleProfile: Error getting user by ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			post.Comments, err = models.GetCommentsByPostID(post.PostID)
			if err != nil {
				log.Println("HandleProfile: Error getting comments by post ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			post.IsLiked = true // no need to check, model will return only liked posts
			pa := PostWithAuthor{Post: post, Author: author}

			posts = append(posts, pa)
		}

		response = posts

	// Placeholder for posts
	default:
		var posts []PostWithAuthor

		user_posts, err := models.GetPostsByAuthorID(profileUserIDUUID)
		if err != nil {
			log.Println("HandleProfile: Error getting posts by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		for i, p := range user_posts {
			post := p //
			if profileUserIDUUID != session_id.User.UserID {
				// if not public, check if user is authorized to view it. private -> should be following, custom -> should be in the list.
				if post.PostExposure == "Private" {
					if ok, _ := models.IsFollower(profileUserIDUUID, session_id.User.UserID); !ok {
						user_posts = append(user_posts[:i], user_posts[i+1:]...)
						continue
					}
				} else if post.PostExposure == "Custom" { //TODO: check if akhaled added the same key for visibility
					flag, err := models.CanUserViewPost(session_id.User.UserID, post.PostID)
					if err != nil {
						log.Printf("HandleProfile: Error checking if user can view post ID %v: %v", post.PostID, err)
						http.Error(w, "Internal Server Error", http.StatusInternalServerError)
						return
					}
					if !flag {
						if i < len(user_posts) {
							// if the post is not visible, remove it and continue
							user_posts = append(user_posts[:i], user_posts[i+1:]...)
						} else {
							user_posts = user_posts[:i]
						}
						continue
					}
				}
			}
			post.Comments, err = models.GetCommentsByPostID(post.PostID)
			if err != nil {
				log.Println("HandleProfile: Error getting comments by post ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			post.IsLiked, err = models.GetIsPostLiked(post.PostID, profileUserIDUUID)
			if err != nil {
				log.Println("HandleProfile: Error getting likes by post ID", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			posts = append(posts, PostWithAuthor{Post: &post, Author: profileUser})

		}

		response = posts
	}

	// if profile is public it is not getting it, so we need to check if the user is following the profile user
	// this is necessary in case of non-early return from the function.
	if user != nil && user.UserID != uuid.Nil {
		profileUser.IsFollowed, err = models.IsFollowing(user.UserID, profileUser.UserID)
		if err != nil {
			log.Println("HandleProfile: Error checking if user is a follower", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
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
		if strings.TrimSpace(info) == "" {
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

	// if the profile is public, then accept all the requests
	if session.User.ProfileExposure == "Public" {
		// Get all the follow requests
		followRequests, err := models.GetRequestsByUserID(session.User.UserID)
		if err != nil {
			log.Println("HandleProfileUpdate: Error getting follow requests by user ID", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		for _, followRequest := range followRequests {
			follow := models.UserFollowModel{
				UserID:     session.User.UserID,
				FollowerID: followRequest.RequesterID,
			}
			follow.Save()
			followRequest.Del()
		}
	}
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
	followingcheck, err := models.GetFollowingUser(uid, session.User.UserID)
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
		noti = fmt.Sprintf("%s %s has requested to follow your account!", session.User.UserFirstName, session.User.UserLastName)
		notiType = "follow_request"
		resp = "Follow Request Sent"
	} else {
		// Populate user_follow model
		follow := models.UserFollowModel{
			UserID:     uid,
			FollowerID: session.User.UserID,
		}
		follow.Save()
		noti = fmt.Sprintf("%s %s has followed your account!", session.User.UserFirstName, session.User.UserLastName)
		notiType = "follow"
		resp = "Follow"
	}

	notification := models.NotificationModel{
		ReceiverID:  uid,
		UserID:      session.User.UserID,
		NotiType:    notiType,
		NotiContent: noti,
		NotiTime:    time.Now(),
		NotiStatus:  "unread",
	}

	if err := notification.Save(); err != nil {
		log.Println("HandleFollow: Error saving notification:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	notify.NotifyUser(uid, notification)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": resp})
}

// HandleFollowRequest handles the HTTP request for responding to a follow request.
// It expects the follow request to be responded to be provided in the request body in JSON format.
// The response is returned in JSON format.
func HandleFollowRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling follow response")

	// Authenticate the user
	session, err := middleware.Auth(r)
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
	followreq, err := models.GetPendingRequest(session.User.UserID, followreq_response.UserID)
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

	followingUser, err := models.GetUserByID(followreq.RequesterID)
	if err != nil {
		log.Println("HandleFollowResponse: Error getting followed user by ID", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	followedUser, err := models.GetUserByID(followreq.UserID)
	if err != nil {
		log.Println("HandleFollowResponse: Error getting follower by ID", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
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
		notification := models.NotificationModel{
			ReceiverID:  followreq.RequesterID,
			NotiType:    "follow_response_accept",
			NotiContent: fmt.Sprintf("%s %s has accepted your follow request!", followedUser.UserFirstName, followedUser.UserLastName),
			NotiTime:    time.Now(),
			NotiStatus:  "unread",
		}
		notification.Save()

		notify.NotifyUser(followingUser.UserID, notification)

	} else {
		// Update the follow request
		followreq.RequestStatus = "reject"
		followreq.Update()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Follow Response"})
}

// HandlePeople handles the HTTP request for retrieving all the users
func HandlePeople(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling people")

	// Authenticate the user
	authUser, err := middleware.Auth(r)
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

	// Create a response structure
	// type UserResponse struct {
	// 	models.UserModel
	// 	IsFollowing bool `json:"is_follower"`
	// }

	// var userResponses []UserResponse

	for i, user := range users {
		isFollowing, err := models.IsFollowing(authUser.User.UserID, user.UserID)
		if err != nil {
			log.Println("HandlePeople: Error checking follower status", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		Reuested, err := models.GetPendingRequest(user.UserID, authUser.User.UserID)
		if err != nil {
			log.Println("HandlePeople: Error checking follower status", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		users[i].IsFollowed = isFollowing
		if Reuested.RequestID != uuid.Nil {
			users[i].IsReuested = true
		}

		// userResponses = append(userResponses, UserResponse{
		// 	UserModel:   user,
		// 	IsFollowing: isFollowing,
		// })
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
