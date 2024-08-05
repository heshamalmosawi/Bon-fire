package server

import (
	"encoding/json"
	"fmt"
	"net/http"
)

/**
 * This file handles the user authentication requests.
 * all the fuctions should be POST requests.
 */

// TODO: Implement the user authentication functions then fix the decumentation based on the implementation.

// HandleLogin handles the login request...
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling login")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "User login"})
}

// HandleSignup handles the signup request...
func HandleSignup(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling signup")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "User signup"})
}

// HandleLogout handles the logout request...
func HandleLogout(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling logout")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "User logout"})
}
