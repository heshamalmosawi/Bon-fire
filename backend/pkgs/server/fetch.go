package server

import (
	"encoding/json"
	"net/http"
	"bonfire/pkgs/models"
	"log"
)

// FetchGroups handles the request for fetching all groups.
func FetchGroups(w http.ResponseWriter, r *http.Request) {
	// Retrieve all groups from the database
	groups, err := models.GetAllGroups()
	if err != nil {
		http.Error(w, "Failed to fetch groups", http.StatusInternalServerError)
		log.Println("Error fetching groups:", err)
		return
	}

	// Return the groups as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(groups); err != nil {
		http.Error(w, "Failed to encode groups to JSON", http.StatusInternalServerError)
		log.Println("Error encoding groups to JSON:", err)
	}
}