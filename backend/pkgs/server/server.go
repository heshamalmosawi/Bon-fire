package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)




func Routers() {

	mux := http.NewServeMux()

	mux.HandleFunc("GET /", HandleDefault)
	mux.HandleFunc("POST /login", HandleLogin)
	mux.HandleFunc("POST /signup", HandleSignup)
	mux.HandleFunc("GET /logout", HandleLogout)
	mux.HandleFunc("GET /profile/{id}", HandleProfile)
	mux.HandleFunc("UPDATE /profile/update", HandleProfileUpdate)
	mux.HandleFunc("POST /follow", HandleFollow)
	mux.HandleFunc("POST /follow_response", HandleFollowResponse)
	mux.HandleFunc("GET /post/{id}", HandlePosts)
	mux.HandleFunc("POST /post/create", HandleCreatePosts)
	mux.HandleFunc("POST /like_post", HandleLikePost)
	mux.HandleFunc("GET /comment/{id}", HandleComment)
	mux.HandleFunc("POST /comment/create", HandleCreateComment)
	mux.HandleFunc("POST /like_comment", HandleLikeComment)
	mux.HandleFunc("GET /group/{id}", HandleGroup)
	mux.HandleFunc("POST /group/create", HandleGroupCreate)
	mux.HandleFunc("POST /group/invite", HandleGroupInvite)
	mux.HandleFunc("POST /group/join", HandleGroupJoin)
	mux.HandleFunc("POST /group/leave", HandleGroupLeave)
	mux.HandleFunc("DELETE /group/delete", HandleGroupDelete)
	mux.HandleFunc("POST /group/event_respose", HandleGroupEventResponse)
	mux.HandleFunc("GET /group/requests", HandleGroupRequests)
	        //! THIS IS TO TEST AUTHENTICATION, PLS DELETE AFTERWARDS
	// 		authentication_test_mux := http.NewServeMux()

	// 		authentication_test_mux.HandleFunc("POST /signup", auth.Signup)
	// 		authentication_test_mux.HandleFunc("POST /login", auth.Login)
	// 		authentication_test_mux.Handle("GET /test", middleware.AuthenticationMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 			w.Write([]byte("Test Access Authorized!"))
	// 		})))
	
	// 		log.Println("auth mux listens and serves on :8080")
	
	// 		http.ListenAndServe(":8080", authentication_test_mux)
	// 	}
	// }

	port := "8080"
	fmt.Println("HTTP server is listening on http://localhost:" + port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
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
	// w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(map[string]string{"response": "Default message Handled"})
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte("<html><body><h1>hello</h1></body></html>"))
}
func HandleError(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling error")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"response": "Error"})
}
