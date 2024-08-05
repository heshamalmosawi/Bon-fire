package auth

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func Login(w http.ResponseWriter, r *http.Request) {
	AuthRequest := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}

	if err := utils.DecodeJSON(r, AuthRequest); err != nil {
		log.Println("Error decoding JSON in login:", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	user, err := models.GetUserByEmail(AuthRequest.Email)
	if err != nil {
		if err == utils.ErrUserNotFound {
			log.Println("user login not found")
			http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}
		log.Println("Error getting user:", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.UserPassword), []byte(AuthRequest.Password)); err != nil {
		log.Println("unauthorized access attempted")
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	}

	session, err := pkgs.MainSessionManager.CreateSession(user)
	if err != nil {
		log.Println("error creating session:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    session.ID,
		MaxAge:   3600 * 24,
		SameSite: http.SameSiteNoneMode,
	})
}
