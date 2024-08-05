package middleware

import (
	"net/http"

	"log/slog"
)

// AuthenticationMiddleware is a middleware that checks for the presence of a "session_id" cookie in the request.
// If the cookie is not present, it logs a warning and responds with a 401 Unauthorized status code.
// Otherwise, it calls the next handler in the chain.
//
// Parameters:
// - next: The next http.Handler to be called if the "user_id" cookie is present.
//
// Returns:
// - http.Handler: The wrapped handler that includes the session validation logic.
func AuthenticationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check for the "user_id" cookie
		_, err := r.Cookie("session_id")
		if err != nil {
			slog.Warn("Request came in with no user_id cookie")
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		// Call the next handler if the "user_id" cookie is found
		next.ServeHTTP(w, r)
	})
}
