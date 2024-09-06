package server

import (
    "encoding/json"
    "net/http"
    "bonfire/pkgs/models"
    "bonfire/pkgs/utils"
    "github.com/gofrs/uuid"
    "log"
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