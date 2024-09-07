package server

import (
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/gofrs/uuid"
)

// HandleAddEvent handles the creation of new group events.
func HandleAddEvent(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusMethodNotAllowed)
        utils.EncodeJSON(w, map[string]string{"error": "Method not allowed"})
        return
    }

    var event models.GroupEvent
    err := json.NewDecoder(r.Body).Decode(&event)
    if err != nil {
        w.WriteHeader(http.StatusBadRequest)
        utils.EncodeJSON(w, map[string]string{"error": "Invalid request data"})
        return
    }

    // Generate new UUID for the event
    eventID, err := uuid.NewV4()
    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        utils.EncodeJSON(w, map[string]string{"error": "Failed to generate event ID"})
        log.Println("Failed to generate UUID for event:", err)
        return
    }
    event.EventID = eventID

    // Save the event using the model's Save method
    if err := event.Save(); err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        utils.EncodeJSON(w, map[string]string{"error": "Failed to save event"})
        log.Println("Error saving event:", err)
        return
    }

    // Respond with success message
    w.WriteHeader(http.StatusCreated)
    utils.EncodeJSON(w, map[string]string{"response": "Event successfully added"})
}

// HandleFetchEventsByGroup handles fetching all events for a specific group.
func HandleFetchEventsByGroup(w http.ResponseWriter, r *http.Request) {
    // Extract the group ID from the URL path
    var user *models.UserModel
	sessionIDCookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Session ID cookie not found", http.StatusUnauthorized)
		return
	}

	// Get the session from the session manager
	session, err := pkgs.MainSessionManager.GetSession(sessionIDCookie.Value)
	if err != nil {
		http.Error(w, "Invalid session detected", http.StatusUnauthorized)
		return
	}
	// Extract the user ID from the session
	user = session.User

    pathParts := strings.Split(r.URL.Path, "/")
    if len(pathParts) < 3 {
        http.Error(w, "Invalid URL path", http.StatusBadRequest)
        return
    }
    groupID := pathParts[2]

    // Fetch events using the provided group ID.
    events, err := models.GetEventsByGroup(groupID,user.UserID)
    if err != nil {
        http.Error(w, "Failed to fetch events: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Set content type and encode the response as JSON.
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(events)
}