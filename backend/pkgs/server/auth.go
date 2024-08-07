package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
)

/**
 * This file handles the user authentication requests.
 * all the fuctions should be POST requests.
*/

// TODO: Implement the logout functions then fix the decumentation based on the implementation.

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

// 	POST /signup
// 	{
// 	    "user_email": "johndoe@example.com",
// 	    "user_password": "password123",
// 	    "user_fname": "John",
// 	    "user_lname": "Doe",
// 	    "user_dob": "1990-01-01",
// 	    "user_avatar_path": "/path/to/avatar",
// 	    "user_nickname": "johnny",
// 	    "user_about": "Just a regular John Doe",
// 	    "profile_exposure": "public"
// 	}

func HandleSignup(w http.ResponseWriter, r *http.Request) {
	var user models.UserModel

	// Decode the JSON payload
	if err := utils.DecodeJSON(r, &user); err != nil {
		log.Println("Error decoding JSON in signup:", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
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

// HandleLogout handles the logout request...
func HandleLogout(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling logout")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "User logout"})
}