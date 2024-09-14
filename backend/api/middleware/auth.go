package middleware

import (
	"bonfire/pkgs"
	"log"
	"net/http"
)

func Auth(r *http.Request) (*pkgs.Session, error) {
	session_id, err := r.Cookie("session_id")
	if err != nil || session_id == nil {
		log.Println("Middleware Auth: Error getting session cookie:", err)
		return nil, err
	}

	// Retrieve the user based on the session information
	session, err := pkgs.MainSessionManager.GetSession(session_id.Value)
	if err != nil || session == nil {
		log.Println("Middleware Auth: Error getting session", err)
		return nil, err
	}
	return session, nil
}
