package auth

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"log"
	"net/http"
)

/*
Signup handles user registration by decoding the JSON payload, saving the user information to the database. 
It responds with the appropriate HTTP status code based on the success or failure of these operations.

Steps:

1. Decode the JSON payload into the UserModel.

2. Hash the user's password.

3. Save the user information into the database.

4. Respond with HTTP status code.

If an error occurs at any step, the function logs the error and responds with an appropriate
HTTP error status code. (frontend validation might be needed!)

Example usage:

	POST /signup
	{
	    "user_email": "johndoe@example.com",
	    "user_password": "password123",
	    "user_fname": "John",
	    "user_lname": "Doe",
	    "user_dob": "1990-01-01",
	    "user_avatar_path": "/path/to/avatar",
	    "user_nickname": "johnny",
	    "user_about": "Just a regular John Doe",
	    "profile_exposure": "public"
	}
*/
func Signup(w http.ResponseWriter, r *http.Request) {
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
