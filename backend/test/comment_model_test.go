package test

import (
	"os"
	"testing"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/models"
	"bonfire/pkgs/storage"
)

func TestGetCommentsByUserID(t *testing.T) {
	storage.InitDB("test")

	// Create a test user
	userID, _ := uuid.NewV4()
	user := models.UserModel{
		UserID:          userID,
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

	// Create a test comment
	commentID, _ := uuid.NewV4()
	comment := models.Comment{
		CommentID:        commentID,
		AuthorID:         userID,
		PostID:           uuid.Nil,
		CommentContent:   "This is a test comment",
		CommentLikeCount: 0,
		CreatedAt:        "2024-01-01T00:00:00Z",
	}

	if err := comment.Save(); err != nil {
		t.Fatal("error creating comment:", err)
	}

	// Get comments by user ID
	comments, err := models.GetCommentsByUserID(userID)
	if err != nil {
		t.Fatal("error getting comments by user ID:", err)
	}

	// Check that the comment is returned
	if len(comments) != 1 {
		t.Fatalf("expected 1 comment, got %d", len(comments))
	}
	if comments[0].CommentID != commentID {
		t.Fatalf("expected comment ID %s, got %s", commentID, comments[0].CommentID)
	}

	// Clean up test comment and user
	if err := comment.Del(); err != nil {
		t.Fatal("error deleting comment:", err)
	}
	if err := user.Del(); err != nil {
		t.Fatal("error deleting user:", err)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test file:", err)
	}
}


func TestGetCommentsByPostID(t *testing.T) {
	storage.InitDB("test")

	// Create a test user
	userID, _ := uuid.NewV4()
	user := models.UserModel{
		UserID:          userID,
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

	// Create a test comment
	commentID, _ := uuid.NewV4()
	comment := models.Comment{
		CommentID:        commentID,
		AuthorID:         userID,
		PostID:           uuid.Nil,
		CommentContent:   "This is a test comment",
		CommentLikeCount: 0,
		CreatedAt:        "2024-01-01T00:00:00Z",
	}

	if err := comment.Save(); err != nil {
		t.Fatal("error creating comment:", err)
	}

	// Get comments by post ID
	comments, err := models.GetCommentsByPostID(uuid.Nil)
	if err != nil {
		t.Fatal("error getting comments by post ID:", err)
	}

	// Check that the comment is returned
	if len(comments) != 1 {
		t.Fatalf("expected 1 comment, got %d", len(comments))
	}
	if comments[0].CommentID != commentID {
		t.Fatalf("expected comment ID %s, got %s", commentID, comments[0].CommentID)
	}

	// Clean up test comment and user
	if err := comment.Del(); err != nil {
		t.Fatal("error deleting comment:", err)
	}
	if err := user.Del(); err != nil {
		t.Fatal("error deleting user:", err)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test file:", err)
	}
}
