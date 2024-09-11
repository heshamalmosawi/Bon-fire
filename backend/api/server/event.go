package server

import (
	"bonfire/api/middleware"
	"bonfire/api/notify"
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofrs/uuid"
)

type GroupEventResponse struct {
	EventID string `json:"event_id"`
	UserID  string `json:"user_id"`
	Going   string `json:"going"`
}

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

	members, err := models.GetGroupMembers(event.GroupID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.EncodeJSON(w, map[string]string{"error": "error getting members"})
		log.Println("Failed to get group members:", err)
		return
	}

	group, err := models.GetGroupByID(event.GroupID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.EncodeJSON(w, map[string]string{"error": "error getting group"})
		log.Println("Failed to get group:", err)
		return
	}

	owner, err2 := models.GetUserByID(group.OwnerID)
	if err2 != nil {
		w.WriteHeader(http.StatusInternalServerError)
		utils.EncodeJSON(w, map[string]string{"error": "error getting group"})
		log.Println("Failed to get group:", err)
		return
	}

 	members = append(members,*owner)
	
	for _, member := range members {
		noti := models.NotificationModel{
			EventID:     eventID,
			ReceiverID:  member.UserID,
			NotiType:    "new_event",
			NotiContent: fmt.Sprintf("%s has a new event!", group.GroupName),
			NotiTime:    time.Now(),
			NotiStatus:  "unread",
		}

		if err := noti.Save(); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println("error saving event noti:", err)
			return
		}

		notify.NotifyUser(member.UserID, noti)
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
	events, err := models.GetEventsByGroup(groupID, user.UserID)
	if err != nil {
		http.Error(w, "Failed to fetch events: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Set content type and encode the response as JSON.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// HandleGroupEventResponse handles the request for responding to a group event.
func HandleGroupEventResponse(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	var resp GroupEventResponse

	if err := json.NewDecoder(r.Body).Decode(&resp); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate event ID
	eventID, err := models.ValidateUUID(resp.EventID, "group_event", "event_id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate user ID
	userID, err := models.ValidateUUID(session.User.UserID.String(), "user", "user_id")
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set ResponseType based on the 'Going' field
	responseType := "not_going"
	if resp.Going == "yes" {
		responseType = "going"
	}

	// Create a new GroupEventAttend object
	eventResponse := models.GroupEventAttend{
		EventID:      eventID,
		AttendeeID:   userID,
		ResponseType: responseType,
	}

	// Save the response
	if err := eventResponse.Save(); err != nil {
		log.Println("Error saving event response:", err)
		http.Error(w, "Failed to save event response", http.StatusInternalServerError)
		return
	}

	// Respond with success message
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Response recorded successfully"})
}

func HandleEventsByUser(w http.ResponseWriter, r *http.Request) {
	session, err := middleware.Auth(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	userID := session.User.UserID

	var events []models.GroupEvent

	groupUsers, err := models.GetGroupsByUser(userID)
	if err != nil {
		log.Printf("HandleEventsByUser: error getting groupUsers: %v\n", err)
		http.Error(w, "internal server error", http.StatusUnauthorized)
		return
	}

	 // Fetch groups where the user is the owner
	 ownedGroups, err := models.GetGroupsOwnedByUser(userID)
	 if err != nil {
		 log.Printf("HandleEventsByUser: error getting owned groups: %v\n", err)
		 http.Error(w, "internal server error", http.StatusInternalServerError)
		 return
	 }

	for _, gu := range groupUsers {
		group_events, err := models.GetEventsByGroup(gu.GroupID.String(), userID)
		if err != nil {
			log.Printf("HandleEventsByUser: error getting events: %v\n", err)
			http.Error(w, "internal server error", http.StatusUnauthorized)
			return
		}
		
		events = append(events, group_events...)
	}

	for _, gu := range ownedGroups {
		group_events, err := models.GetEventsByGroup(gu.GroupID.String(), userID)
		if err != nil {
			log.Printf("HandleEventsByUser: error getting events: %v\n", err)
			http.Error(w, "internal server error", http.StatusUnauthorized)
			return
		}
		
		events = append(events, group_events...)
	}

	if err := utils.EncodeJSON(w, events); err != nil {
		log.Printf("HandleEventsByUser: error sending events: %v\n", err)
		http.Error(w, "internal server error", http.StatusUnauthorized)
		return
	}
}
