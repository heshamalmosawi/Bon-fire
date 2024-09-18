package test

import (
	"bonfire/api/server"
	"bonfire/pkgs"
	"bonfire/pkgs/models"
	"bonfire/pkgs/storage"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestHandleProfileUpdate(t *testing.T) {

	// var sessionManager = pkgs.NewSessionManager(time.Hour * 24)

	storage.InitDB("test")
	user := models.UserModel{
		UserEmail:       "test@example.com",
		UserPassword:    "123123",
		UserFirstName:   "John",
		UserLastName:    "Doe",
		UserDOB:         "24/10/2004",
		UserAvatarPath:  "/path/to/avatar",
		UserNickname:    "testuser",
		UserBio:         "This is a test user",
		ProfileExposure: "Private",
	}

	if err := user.Save(); err != nil {
		t.Fatal("error creating user:", err)
	}

	// Create a session for the test user
	session, err := pkgs.MainSessionManager.CreateSession(&user)
	if err != nil {
		t.Fatal("error creating session:", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("PUT /profile/update", server.HandleProfileUpdate)

	// Create the payload for the PUT request
	payload := map[string]string{
		"ProfileExposure": "Public",
	}

	p_bytes, err := json.Marshal(payload)
	if err != nil {
		t.Fatal("error marshaling payload:", err)
	}

	// Create a new PUT request
	req, err := http.NewRequest("PUT", "/profile/update", bytes.NewBuffer(p_bytes))
	if err != nil {
		t.Fatal("error creating request:", err)
	}
	req.Header.Set("Content-Type", "application/json")

	req.AddCookie(&http.Cookie{
		Name:     "session_id",
		Value:    session.ID,
		MaxAge:   3600 * 24, // 1 day
		HttpOnly: true,      // Secure cookie to prevent XSS
		SameSite: http.SameSiteNoneMode,
	})

	// recorder to gather the http response
	response_recorder := httptest.NewRecorder()

	// serve the request through the servemux
	mux.ServeHTTP(response_recorder, req)

	// Check the status code
	if response_recorder.Code != http.StatusOK {
		t.Fatalf("handler returned wrong status code: got %v want %v", response_recorder.Code, http.StatusOK)
	}

	var response map[string]interface{}
	err = json.Unmarshal(response_recorder.Body.Bytes(), &response)
	if err != nil {
		t.Fatal("error unmarshaling response body:", err)
	}

	if message, ok := response["response"].(string); !ok || message != "Profile updated successfully" {
		t.Errorf("unexpected response message: got %v want %v", response["response"], "Profile updated successfully")
	}

	new_user, err := models.GetUserByEmail("test@example.com")
	if err != nil {
		t.Fatal("error getting user by email:", err)
	}

	if new_user.UserID != user.UserID {
		t.Fatal("FAIL: new user has different UserID")
	} else if new_user.ProfileExposure != "Public" {
		t.Fatalf("FAIL: unexpected profile exposure: got %v want 'Public'", new_user.ProfileExposure)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test.db file:", err)
	}
}
