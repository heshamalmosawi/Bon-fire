package server

import (
	"encoding/json"
	"fmt"
	"net/http"
)

/**
 * This file handles the group related requests.
 */

// TODO: Implement the group functions then fix the decumentation based on the implementation.

// HandleGroup handles the request for group related operations.
func HandleGroup(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupCreate handles the request for creating a new group.
func HandleGroupCreate(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupInvite handles the request for inviting users to a group.
func HandleGroupInvite(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupJoin handles the request for joining a group.
func HandleGroupJoin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupLeave handles the request for leaving a group.
func HandleGroupLeave(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupDelete handles the request for deleting a group.
func HandleGroupDelete(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupEventResponse handles the request for responding to a group event.
func HandleGroupEventResponse(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}

// HandleGroupRequests handles the request for managing group requests.
func HandleGroupRequests(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}
