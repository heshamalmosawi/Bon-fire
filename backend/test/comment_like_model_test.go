package test

import (
	"os"
	"testing"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/models"
	"bonfire/pkgs/storage"
)

// need more testiing for this func.
func TestGetLikesByCommentID(t *testing.T) {
	storage.InitDB("test")

	// Create a test comment like
	commentLikeID, _ := uuid.NewV4()
	commentID, _ := uuid.NewV4()
	commentLike := models.LikeModel{
		LikeID:    commentLikeID,
		CommentID: commentID,
		UserID:    uuid.Nil,
	}

	if err := commentLike.Save(); err != nil {
		t.Fatal("error creating comment like:", err)
	}

	// Get likes by comment ID
	likes, err := models.GetLikesByCommentID(commentID)
	if err != nil {
		t.Fatal("error getting likes by comment ID:", err)
	}

	// Check that the comment like is returned
	if len(likes) != 1 {
		t.Fatalf("expected 1 like, got %d %v", len(likes), likes)
	}
	if likes[0].LikeID != commentLikeID {
		t.Fatalf("expected comment like ID %s, got %s", commentLikeID, likes[0].LikeID)
	}

	// Clean up test comment like
	if err := commentLike.Del(); err != nil {
		t.Fatal("error deleting comment like:", err)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test file:", err)
	}
}

func TestToggleCommentLike(t *testing.T) {
	storage.InitDB("test")

	commentID, _ := uuid.NewV4()
	userID, _ := uuid.NewV4()

	// Toggle like for a comment
	err := models.ToggleCommentLike(commentID, userID)
	if err != nil {
		t.Fatal("error toggling comment like:", err)
	}

	// Check if the like is toggled
	like, err := models.GetLikeByCommentAndUser(commentID, userID)
	if err != nil {
		t.Fatal("error getting comment like:", err)
	}
	if like == nil {
		t.Fatal("expected comment like, got nil")
	}

	// Toggle like again
	err = models.ToggleCommentLike(commentID, userID)
	if err != nil {
		t.Fatal("error toggling comment like:", err)
	}

	// Check if the like is removed
	like, err = models.GetLikeByCommentAndUser(commentID, userID)
	if err != nil {
		t.Fatal("error getting comment like:", err)
	}
	if like != nil {
		t.Fatal("expected nil, got comment like")
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test file:", err)
	}
}
