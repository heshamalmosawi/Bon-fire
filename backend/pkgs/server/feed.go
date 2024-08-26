package server

import (
	"bonfire/api/middleware"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"log"
	"net/http"
)

func GetFeed(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		log.Println("Error authorizing user:", err)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	posts, err := models.GetViewablePosts(session.User.UserID)
	if err != nil {
		log.Println("error getting user feed:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	var result []struct {
		Post   models.PostModel `json:"post"`
		Author models.UserModel `json:"author"`
	}

	// we send the posts, and its author too
	for _, post := range posts {
		author, err := models.GetUserByID(post.AuthorID)
		if err != nil {
			log.Println("error getting post for user:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		result = append(result, struct {
			Post   models.PostModel `json:"post"`
			Author models.UserModel `json:"author"`
		}{
			Post:   post,
			Author: *author,
		})
	}

	if err := utils.EncodeJSON(w, result); err != nil {
		log.Println("error encoding user feed:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
