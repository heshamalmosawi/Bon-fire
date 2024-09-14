package server

import (
	"log"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"bonfire/api/middleware"
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
)

/**
 * This file handles the user authentication requests.
 * all the fuctions should be POST requests.
 */

// Login handles user authentication by verifying email and password.
// It creates a session and sets a session cookie upon successful authentication.
func HandleLogin(w http.ResponseWriter, r *http.Request) {

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

	// remove old session of user if any
	if prev_session, err := pkgs.MainSessionManager.GetSessionByUser(user); err == nil {
		pkgs.MainSessionManager.DeleteSession(prev_session.ID)
	}

	// create new session
	session, err := pkgs.MainSessionManager.CreateSession(user)
	if err != nil {
		log.Printf("Error creating session for user: %s, error: %v", user.UserEmail, err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "session_id",
		Value:   session.ID,
		Expires: time.Now().Add(time.Hour * 24),
	})

	// Set the session cookie
	utils.EncodeJSON(w, struct {
		SessionID string `json:"session_id"`
	}{
		SessionID: session.ID,
	})
}

// Signup handles user registration by decoding the JSON payload, saving the user information to the database.
// It responds with the appropriate HTTP status code based on the success or failure of these operations.

// Steps:

// 1. Decode the JSON payload into the UserModel.

// 2. Hash the user's password.

// 3. Save the user information into the database.

// 4. Respond with HTTP status code.

// If an error occurs at any step, the function logs the error and responds with an appropriate
// HTTP error status code. (frontend validation might be needed!)

// Example usage:

// POST /signup
//
//	{
//	    "user_email": "johndoe@example.com",
//	    "user_password": "password123",
//	    "user_fname": "John",
//	    "user_lname": "Doe",
//	    "user_dob": "1990-01-01",
//	    "user_avatar_path": "/path/to/avatar",
//	    "user_nickname": "johnny",
//	    "user_about": "Just a regular John Doe",
//	    "profile_exposure": "Public"
//	}
func HandleSignup(w http.ResponseWriter, r *http.Request) {
	var user models.UserModel

	// Decode the JSON payload
	if err := utils.DecodeJSON(r, &user); err != nil {
		log.Println("Error decoding JSON in signup:", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}

	// Validating that all *required* user fields except id are not empty or whitespaces
	user.UserEmail = strings.TrimSpace(user.UserEmail)
	user.UserPassword = strings.TrimSpace(user.UserPassword)
	user.UserFirstName = strings.TrimSpace(user.UserFirstName)
	user.UserLastName = strings.TrimSpace(user.UserLastName)
	user.UserDOB = strings.TrimSpace(user.UserDOB)
	user.ProfileExposure = "Public"
	if user.UserEmail == "" || user.UserPassword == "" || user.UserFirstName == "" || user.UserLastName == "" || user.UserDOB == "" || user.ProfileExposure == "" {
		log.Println("Error: Missing required fields in user data.")
		http.Error(w, "HandleSignup: Missing required fields in user data.", http.StatusBadRequest)
		return
	}

	// Save the user information into the database
	if err := user.Save(); err != nil {
		log.Println("Error saving user into DB:", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	// Respond with HTTP status code 201 (Created)
	w.WriteHeader(http.StatusCreated)
}

// HandleLogout handles the logout request by deleting the user's session.
func HandleLogout(w http.ResponseWriter, r *http.Request) {
	// Assuming the session ID is stored in a cookie named "session_id"
	cookie, err := r.Cookie("session_id")
	if err != nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	sessionID := cookie.Value

	// Delete the session
	pkgs.MainSessionManager.DeleteSession(sessionID)

	// Clear the session cookie
	cookie = &http.Cookie{
		Name:    "session_id",
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0), // expire cookie immediately
	}
	http.SetCookie(w, cookie)

	log.Println("User logged out successfully")
	w.WriteHeader(http.StatusOK)
}

// This function is called on an endpoint to authenticate a user. It is used to check the validity of a session from the frontend.
func authenticate(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		expiringCookie := http.Cookie{
			Name:    "session_id",
			Value:   "",
			Expires: time.Unix(0, 0),
			MaxAge:  -1,
		}

		http.SetCookie(w, &expiringCookie)
		w.WriteHeader(http.StatusUnauthorized)
		log.Print("authenticate: Error authenticating user: ", err)
	}

	log.Print("authenticate: User authenticated successfully")
	// Respond with the user's session information
	utils.EncodeJSON(w, session)
}
