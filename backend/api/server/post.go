package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofrs/uuid"

	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
)

/**
 * This file handles the post requests.
 */

//  TODO: Implement the like post function then write the decumantation based on the implementation.

// HandlePosts handles the HTTP request for retrieving a post.
// It requires a valid post ID to be present in the request.
func HandlePosts(w http.ResponseWriter, r *http.Request) {

	/// Get the post ID from the query parameters
	groupIDStr := r.URL.Query().Get("group_id")

	// Get the session cookie to check if the user is logged in
	session_id, err1 := r.Cookie("session_id")

	var session *pkgs.Session
	var err2 error
	err2 = nil

	// Check if the user is logged in
	if err1 == nil && session_id != nil {
		// Retrieve the user based on the session information
		session, err2 = pkgs.MainSessionManager.GetSession(session_id.Value)
	}

	var posts []models.PostModel
	var err error

	/// Check if the group ID is provided in the query parameters
	if groupIDStr != "" {
		user := session.User
		groupID, err := uuid.FromString(groupIDStr)
		if err != nil {
			http.Error(w, "Invalid group ID", http.StatusBadRequest)
			return
		}
		posts, err = models.GetPostsByGroupID(groupID, user.UserID)
		if err != nil {
			http.Error(w, "Error retrieving posts", http.StatusInternalServerError)
			return
		}
	} else if session != nil && err2 == nil {
		// Get the user from the session
		user := session.User
		// Get the user's posts
		posts, err = models.GetViewablePosts(user.UserID)
		if err != nil {
			http.Error(w, "Error retrieving posts", http.StatusInternalServerError)
			return
		}
	} else {
		// Get all public posts in case the user wasn't logged in
		posts, err = models.GetAllPublicPosts()
		if err != nil {
			http.Error(w, "Error retrieving posts", http.StatusInternalServerError)
			return
		}
	}

	for i, v := range posts {
		v.IsLiked, err = models.GetIsPostLiked(v.PostID, session.User.UserID)
		if err != nil {
			http.Error(w, "Error retrieving post isLiked", http.StatusInternalServerError)
			return
		}

		posts[i] = v
	}

	utils.EncodeJSON(w, map[string]interface{}{
		"posts": posts,
	})
}

type PostRequest struct {
	PostContent   string `json:"post_content"`
	PostImagePath string `json:"post_image_path"`
	PostExposure  string `json:"post_exposure"`
	GroupID       string `json:"group_id"`
	CustomFollowers []string `json:"selectedFollowers"`
}

func HandleCreatePosts(w http.ResponseWriter, r *http.Request) {
	// Parse the JSON body
	var postRequest PostRequest
	err := json.NewDecoder(r.Body).Decode(&postRequest)
	if err != nil {
		log.Println("Error decoding JSON:", err)
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Retrieve session ID from the cookie
	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		log.Println(err)
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}

	// Get the session from the session manager
	session, err := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
		return
	}
	// Extract the user ID from the session
	authorID := session.User.UserID

	// Parse the GroupID from the JSON
	var groupID uuid.UUID
	if postRequest.GroupID != "" {
		groupUUID, err := uuid.FromString(postRequest.GroupID)
		if err != nil {
			http.Error(w, "Invalid group ID", http.StatusBadRequest)
			return
		}
		groupID = groupUUID
	} else {
		groupID = uuid.Nil
	}

	// Create a new post model instance
	postID, err := uuid.NewV4()
	if err != nil {
		http.Error(w, "Failed to generate post ID", http.StatusInternalServerError)
		return
	}

	location, _ := time.LoadLocation("Etc/GMT-3")
	createdAt := time.Now().In(location).Format(time.RFC3339)

	post := models.PostModel{
		PostID:        postID,
		PostContent:   strings.ReplaceAll(postRequest.PostContent, "\\n", "\n"),
		PostImagePath: postRequest.PostImagePath,
		PostExposure:  postRequest.PostExposure,
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

	if postRequest.PostExposure == "Custom" && len(postRequest.CustomFollowers) > 0 {
        var userIDs []uuid.UUID
		fmt.Println(postRequest.CustomFollowers)
        for _, id := range postRequest.CustomFollowers {
            userID, err := uuid.FromString(id)
            if err != nil {
                log.Printf("Invalid UUID in Custom followers: %v", err)
                continue // Log invalid UUIDs but do not terminate the operation
            }
            userIDs = append(userIDs, userID)
        }
        // Create views for each follower
        if err := models.CreatePostViewsForUsers(postID, userIDs); err != nil {
            http.Error(w, "Failed to save Custom views", http.StatusInternalServerError)
            return
        }
    }

	// Respond with a success message
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Post created", "post_id": postID.String()})
}

// HandleLikePost handles the HTTP request for liking a post.
func HandleLikePost(w http.ResponseWriter, r *http.Request) {
	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}
	session, err := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)
	if err != nil {
		http.Error(w, "Invalid or expired session", http.StatusUnauthorized)
		return
	}

	//get user id
	userID := session.User.UserID

	postID := r.PathValue("id")
	if postID == "" {
		http.Error(w, "post id pathvalue not provided", http.StatusBadRequest)
		return
	}

	parsedPostID, err := uuid.FromString(postID)
	if err != nil {
		http.Error(w, "post uuid is unable to be parsed", http.StatusInternalServerError)
		return
	}

	err = models.TogglePostLike(parsedPostID, userID)
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, "Failed to toggle like", http.StatusInternalServerError)
		return
	}

	// Get the updated number of likes for the post
	likeCount, err := models.GetNumberOfLikesByPostID(parsedPostID)
	if err != nil {
		http.Error(w, "Failed to retrieve like count", http.StatusInternalServerError)
		return
	}

	// Respond with a success message and updated like count
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"response":   "Like toggled successfully",
		"like_count": likeCount,
	})
}
