package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/gofrs/uuid"

	"bonfire/api/server"
	"bonfire/pkgs/models"
)

func TestHandleCreateComment(t *testing.T) {
	setup() // Call the setup function to initialize the database

	// in case you need a post to comment on:
	// TestHandleCreatePosts(t)

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
	// Initialize the test comment
	comment := models.Comment{
		CommentID:      uuid.Nil,
		PostID:         uuid.FromStringOrNil("f39f1bd4-655a-447b-bf50-405ed9e1ed45"),
		AuthorID:       uuid.Must(uuid.NewV4()),
		CommentContent: "Test comment content",
		CreatedAt:      time.Now().String(),
	}
	// Encode the comment as JSON
	commentJSON, err := json.Marshal(comment)
	if err != nil {
		t.Fatal(err)
	}
	// Create a new request with the comment JSON
	req, err := http.NewRequest("POST", "/create-comment", bytes.NewBuffer(commentJSON))
	if err != nil {
		t.Fatal(err)
	}
	// Set the request content type
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(sessionCookie)
	// Create a response recorder
	rr := httptest.NewRecorder()
	// Call the HandleCreateComment function
	server.HandleCreateComment(rr, req)
	// Check the response status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("HandleCreateComment returned wrong status code: got %v, want %v", status, http.StatusOK)
	}
	// Check the response body
	expectedResponse := map[string]string{"response": "Comment created"}
	var actualResponse map[string]string
	err = json.Unmarshal(rr.Body.Bytes(), &actualResponse)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(actualResponse, expectedResponse) {
		t.Errorf("HandleCreateComment returned unexpected response: got %v, want %v", actualResponse, expectedResponse)
	}
}

func TestHandleComment(t *testing.T) {
	setup() // Call the setup function to initialize the database

	// Create a new comment for testing
	// call TestHandleCreateComment(t) to create a comment
	// TestHandleCreateComment(t)

	// Create a new request with the comment ID as a query parameter
	req, err := http.NewRequest("GET", "/comment?post_id=0b41c532-918d-4075-b8e5-b137edcef7e6", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a response recorder
	rr := httptest.NewRecorder()

	// Call the HandleComment function
	server.HandleComment(rr, req)

	// Check the response status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("HandleComment returned wrong status code: got %v, want %v", status, http.StatusOK)
	}

	// Check the response body
	var response []models.Comment
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(response)

	// Check if the retrieved comment matches the expected comment (i tried to get all the 4 comments)
	if len(response) == 0 {
		t.Errorf("HandleComment returned no comments")
	}
}

func TestHandleLikeComment(t *testing.T) {
	setup() // Call the setup function to initialize the database

	// Create a new comment for testing
	// comment := models.Comment{
	// 	CommentID:      uuid.FromStringOrNil("f39f1bd4-655a-447b-bf50-405ed9e1ed45"),
	// 	PostID:         uuid.FromStringOrNil("0b41c532-918d-4075-b8e5-b137edcef7e6"),
	// 	AuthorID:       uuid.Must(uuid.NewV4()),
	// 	CommentContent: "Test comment content",
	// 	CreatedAt:      time.Now().String(),
	// }
	// err := comment.Save()
	// if err != nil {
	// 	t.Fatal(err)
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

	// Create a new request with the comment ID as a query parameter
	req, err := http.NewRequest("POST", "/like-comment?comment_id=9db5832e-125b-41a7-9ca3-bb5edfaa4c89", nil)
	if err != nil {
		t.Fatal(err)
	}

	req.AddCookie(sessionCookie)

	// Create a response recorder
	rr := httptest.NewRecorder()

	// Call the HandleLikeComment function
	server.HandleLikeComment(rr, req)

	// Check the response status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("HandleLikeComment returned wrong status code: got %v, want %v", status, http.StatusOK)
	}

	// Check the response body
	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Fatal(err)
	}

	// all good.
	// Check if the like count is present in the response
	likes, ok := response["like_count"]

	if !ok || likes != 1 {
		t.Errorf("HandleLikeComment returned unexpected response: got %v, want %v", response, map[string]interface{}{"like_count": 1})
	}
}
