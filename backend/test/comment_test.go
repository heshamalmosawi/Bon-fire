package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/models"
	"bonfire/pkgs/server"
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
        PostID:         uuid.Must(uuid.NewV4()),
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