package main

import (
	"bonfire/api/middleware"
	"bonfire/api/routes/auth"
	"bonfire/pkgs/storage"
	"log"
	"net/http"
	"os"
)

func main() {
	if len(os.Args[1:]) > 0 {
		if os.Args[1] == "migrate" {
			storage.RedoMigrations("prod")
		}
	} else {
		storage.InitDB("prod")

		//! THIS IS TO TEST AUTHENTICATION, PLS DELETE AFTERWARDS
		authentication_test_mux := http.NewServeMux()

		authentication_test_mux.HandleFunc("POST /signup", auth.Signup)
		authentication_test_mux.HandleFunc("POST /login", auth.Login)
		authentication_test_mux.Handle("GET /test", middleware.AuthenticationMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Test Access Authorized!"))
		})))

		log.Println("auth mux listens and serves on :8080")

		http.ListenAndServe(":8080", authentication_test_mux)
	}
}
