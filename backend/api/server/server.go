package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	// "bonfire/api/chat"
	"bonfire/api/middleware"
	"bonfire/api/notify"
	"bonfire/pkgs"
	"bonfire/pkgs/utils"
)

// TODO: Implement the default function then fix the decumentation based on the implementation.

// Routers sets up the HTTP server routes and starts the server.
// It creates a new HTTP server multiplexer, registers the route handlers,
// and starts the server on the specified port.
func Routers() {
	mux := http.NewServeMux()

	// the default route handler
	// TODO: tidy this up
	mux.HandleFunc("GET /", HandleDefault)
	mux.HandleFunc("POST /login", HandleLogin)                 // ✅
	mux.HandleFunc("POST /signup", HandleSignup)               // ✅
	mux.HandleFunc("POST /logout", HandleLogout)                // ✅
	mux.HandleFunc("GET /feed", GetFeed)                       // ✅
	mux.HandleFunc("GET /profile/{id}", HandleProfile)         // ✅
	mux.HandleFunc("PUT /profile/update", HandleProfileUpdate) // ✅
	mux.HandleFunc("POST /follow", HandleFollow)
	mux.HandleFunc("POST /follow_response", HandleFollowRequest)
	mux.HandleFunc("POST /people", HandlePeople)
	mux.HandleFunc("GET /post/{id}", HandlePosts)                // ✅
	mux.HandleFunc("POST /post/create", HandleCreatePosts)       // ✅
	mux.HandleFunc("POST /like_post/{id}", HandleLikePost)       // ✅
	mux.HandleFunc("GET /comment/{id}", HandleComment)           // ✅
	mux.HandleFunc("POST /comment/create", HandleCreateComment)  // ✅
	mux.HandleFunc("POST /like_comment/{id}", HandleLikeComment) // ✅
	mux.HandleFunc("GET /group/{id}", HandleGroup)
	mux.HandleFunc("POST /group/create", HandleGroupCreate)
	mux.HandleFunc("POST /group/invite", HandleGroupInvite)
	mux.HandleFunc("POST /group/join", HandleGroupJoin)
	mux.HandleFunc("POST /group/leave", HandleGroupLeave)
	mux.HandleFunc("DELETE /group/delete", HandleGroupDelete)
	mux.HandleFunc("POST /group/event_response", HandleGroupEventResponse)
	mux.HandleFunc("POST /group/request", HandleGroupRequests)
	mux.HandleFunc("GET /fetchGroups", FetchGroups)
	mux.HandleFunc("GET /messages", HandleMessages)
	mux.HandleFunc("POST /messages/create", HandleStoreMessages)
	mux.HandleFunc("POST /groupmsg/create", HandleStoreGroupMessages)

	mux.HandleFunc("POST /authenticate", authenticate)
	mux.HandleFunc("GET /ws", handleConnections)
	mux.HandleFunc("GET /subscribe", notify.HandleSubscription)
	mux.HandleFunc("DELETE /notis/{id}", notify.DeleteNoti)
	mux.HandleFunc("PUT /notis/read-all", notify.ReadAllNotis)

	mux.HandleFunc("GET /requests/{group_id}", HandleFetchGroupRequests)
	mux.HandleFunc("GET /fetchpeople/{group_id}", HandleFetchUsersNotInGroup)
	mux.HandleFunc("POST /addevent", HandleAddEvent)
	mux.HandleFunc("GET /events/{group_id}", HandleFetchEventsByGroup)
	mux.HandleFunc("GET /user-events", HandleEventsByUser)	
	mux.HandleFunc("POST /getmessagelist", MessagerListAPI)

	// handle cors
	cors_mux := middleware.CORS(mux)

	go pkgs.MainSessionManager.CleanupExpiredSessions()
	// go chat.RemoveExpiredChatClients()
	go notify.RemoveExpiredSubscriber()

	utils.BonfireLogger.Info("HTTP server is listening on http://localhost:8080")

	if err := http.ListenAndServe(":8080", cors_mux); err != nil {
		fmt.Println("Error starting server:", err)
		log.Fatal(err.Error())
	}
}

// example of how to add the Handle function to the router
// func HandleMessage1(w http.ResponseWriter, r *http.Request) {
// 	  fmt.Println("Handling message1")
//    -- the correct way of serving the json.
//    w.Header().Set("Content-Type", "application/json")
//    json.NewEncoder(w).Encode(map[string]string{"response": "Message1 Handled"})
// }

func HandleDefault(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling default message")
	fmt.Println(r.URL.Path)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Default message Handled"})

	// for testing.
	// w.Header().Set("Content-Type", "text/html")
	// w.Write([]byte("<html><body><h1>hello</h1></body></html>"))
}

func HandleError(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}
