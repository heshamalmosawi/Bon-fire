package test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"bonfire/pkgs/server"
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

