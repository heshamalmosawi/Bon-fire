package server

import (
	"bonfire/api/middleware"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"fmt"
	"log"
	"net/http"
)

func GetFeed(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		log.Println("Error authorizing user:", err)
		w.WriteHeader(http.StatusUnauthorized)
	}

	posts, err := models.GetViewablePosts(session.User.UserID)
	if err != nil {
		log.Println("error getting user feed:", err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	fmt.Println(posts)

	if err := utils.EncodeJSON(w, posts); err != nil {
		log.Println("error encoding user feed:", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}
