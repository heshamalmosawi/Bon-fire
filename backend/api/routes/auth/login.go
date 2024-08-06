package auth

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// Login handles user authentication by verifying email and password.
// It creates a session and sets a session cookie upon successful authentication.
func Login(w http.ResponseWriter, r *http.Request) {
	// Define a struct to capture login request data
	AuthRequest := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}

	// Decode the JSON body into AuthRequest struct
	if err := utils.DecodeJSON(r, &AuthRequest); err != nil {
		log.Printf("Error decoding JSON in login: %v", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	// Retrieve user by email
	user, err := models.GetUserByEmail(AuthRequest.Email)
	if err != nil {
		if err == utils.ErrUserNotFound {
			log.Printf("User login not found: %s", AuthRequest.Email)
			http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}
		log.Printf("Error getting user: %v", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	// Compare hashed password with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.UserPassword), []byte(AuthRequest.Password)); err != nil {
		log.Printf("Unauthorized access attempted for user: %s", AuthRequest.Email)
		http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		return
	}

	// Create a new session for the authenticated user
	session, err := pkgs.MainSessionManager.CreateSession(user)
	if err != nil {
		log.Printf("Error creating session for user: %s, error: %v", user.UserEmail, err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	// Set the session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    session.ID,
		MaxAge:   3600 * 24, // 1 day
		HttpOnly: true,      // Secure cookie to prevent XSS
		SameSite: http.SameSiteNoneMode,
	})

	// Respond with a success status
	w.Write([]byte("Authentication successful!"))
}
