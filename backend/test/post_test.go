package test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"bonfire/api/server"
	"bonfire/pkgs/storage"
)

func TestHandlePosts(t *testing.T) {
	storage.InitDB("test")
	defer storage.DB.Close()

	req, err := http.NewRequest("GET", "/posts", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.HandlePosts)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("HandlePosts returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	//! if case it was null
	// expected := `{"posts": []}`
	// if rr.Body.String() != expected {
	// 	t.Errorf("HandlePosts returned unexpected body: got %v want %v", rr.Body.String(), expected)
	// }
}

func TestHandleCreatePosts(t *testing.T) {
	storage.InitDB("test")
	defer storage.DB.Close()

	// Create a new user by calling the HandleSignup function
	// signupPayload := `{
	//     "user_email": "johndoe@example.com",
	//     "user_password": "password123",
	//     "user_fname": "John",
	//     "user_lname": "Doe",
	//     "user_dob": "1990-01-01",
	//     "user_avatar_path": "/path/to/avatar",
	//     "user_nickname": "johnny",
	//     "user_about": "Just a regular John Doe",
	//     "profile_exposure": "Public"
	// }`
	// signupReq, err := http.NewRequest("POST", "/signup", strings.NewReader(signupPayload))
	// if err != nil {
	//     t.Fatal(err)
	// }
	// signupReq.Header.Set("Content-Type", "application/json")
	// signupRR := httptest.NewRecorder()
	// server.HandleSignup(signupRR, signupReq)
	// if signupRR.Code != http.StatusCreated {
	//     t.Fatalf("expected status code %d, got %d", http.StatusCreated, signupRR.Code)
	// }

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

	// Create a new request with the necessary form values
	form := url.Values{}
	form.Add("post_content", "Test post content")
	form.Add("post_image_path", "/path/to/image.jpg")
	form.Add("post_exposure", "Public")
	req, err := http.NewRequest("POST", "/create-post", strings.NewReader(form.Encode()))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(sessionCookie)
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(server.HandleCreatePosts)
	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("HandleCreatePosts returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Remove the declaration of the unused variable
	var actualResponse map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &actualResponse); err != nil {
		t.Fatalf("could not unmarshal response: %v", err)
	}
	if actualResponse["response"] != "Post created" {
		t.Errorf("HandleCreatePosts returned unexpected response: got %v want %v", actualResponse["response"], "Post created")
	}
}
