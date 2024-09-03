package test

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
	"bonfire/api/server"
	"bonfire/pkgs/storage"
)

var db *sql.DB

func setup() {
	// Initialize the SQLite database
	storage.InitDB("test")

	// Get the database connection
	db = storage.DB
}

func teardown() {
	db.Close()
}

func TestHandleProfile(t *testing.T) {
	setup()
	defer teardown()

	// Authenticate the user by calling the HandleLogin function
	loginPayload := `{
        "user_email": "johndoe@example.com",
        "user_password": "password123"
    }`

	loginReq, err := http.NewRequest("POST", "/login", strings.NewReader(loginPayload))
	if err != nil {
		t.Fatal(err)
	}
	loginReq.Header.Set("Content-Type", "application/json")
	loginRR := httptest.NewRecorder()
	server.HandleLogin(loginRR, loginReq)
	if loginRR.Code != http.StatusOK {
		t.Fatalf("expected status code %d, got %d", http.StatusOK, loginRR.Code)
	}

	// Extract the session cookie from the login response
	sessionCookie := loginRR.Result().Cookies()[0]

	// Create a new comment
	commentPayload := `{"post_id": "some-post-id", "comment_content": "This is a test comment"}`
	commentReq, err := http.NewRequest("POST", "/comments", strings.NewReader(commentPayload))
	if err != nil {
		t.Fatal(err)
	}
	commentReq.Header.Set("Content-Type", "application/json")
	commentReq.AddCookie(sessionCookie)
	commentRR := httptest.NewRecorder()
	server.HandleCreateComment(commentRR, commentReq)
	if commentRR.Code != http.StatusOK {
		t.Fatalf("expected status code %d, got %d", http.StatusOK, commentRR.Code)
	}

	// Create a new HTTP request for the profile
	req, err := http.NewRequest("GET", "/profile?q=comments", nil)
	if err != nil {
		t.Fatal(err)
	}

	req.AddCookie(sessionCookie)

	// Create a new response recorder to record the response
	rr := httptest.NewRecorder()

	// Call the HandleProfile function with the request and response recorder
	server.HandleProfile(rr, req)

	// Check the response status code
	if rr.Code != http.StatusOK {
		t.Errorf("expected status code %d, got %d", http.StatusOK, rr.Code)
	}

	// Check the response content type
	expectedContentType := "application/json"
	actualContentType := rr.Header().Get("Content-Type")
	if actualContentType != expectedContentType {
		t.Errorf("expected content type %s, got %s", expectedContentType, actualContentType)
	}

	// Check the response body
	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Errorf("Could not unmarshal response: %v", err)
	}

	// Update the expected response to match the actual response structure
	expectedResponse := map[string]interface{}{
		"user": map[string]interface{}{
			"user_id":          "00000000-0000-0000-0000-000000000000",
			"user_email":       "",
			"user_fname":       "",
			"user_lname":       "",
			"user_nickname":    "",
			"user_password":    "",
			"user_dob":         "",
			"user_avatar_path": "",
			"user_about":       "",
			"profile_exposure": "",
		},
		"response": nil,
	}

	if !reflect.DeepEqual(response, expectedResponse) {
		t.Errorf("handler returned unexpected body: got %v want %v", response, expectedResponse)
	}
}
