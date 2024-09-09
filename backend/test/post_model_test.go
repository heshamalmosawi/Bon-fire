package test

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/storage"
	"os"
	"testing"
	"github.com/gofrs/uuid"
)

func TestPostCRUD(t *testing.T) {
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

	// Create a test post
	postID, _ := uuid.NewV4()
	post := models.PostModel{
		PostID:        postID,
		PostContent:   "This is a test post",
		PostImagePath: "/path/to/image",
		PostExposure:  "Public",
		GroupID:       uuid.Nil, 
		PostLikeCount: 0,
		CreatedAt:     "2024-01-01T00:00:00Z",
		AuthorID:      userID,
	}

	if err := post.Save(); err != nil {
		t.Fatal("error creating post:", err)
	}

	// Update the post
	post.PostContent = "This is an updated test post"

	if err := post.Update(); err != nil {
		t.Fatal("error updating post:", err)
	}

	// Delete the post
	if err := post.Del(); err != nil {
		t.Fatal("error deleting post:", err)
	}

	// Clean up test user
	if err := user.Del(); err != nil {
		t.Fatal("error deleting user:", err)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test.db file:", err)
	}
}

func TestPostLikeToggle(t *testing.T) {
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

	// Create a test post
	postID, _ := uuid.NewV4()
	post := models.PostModel{
		PostID:        postID,
		PostContent:   "This is a test post",
		PostImagePath: "/path/to/image",
		PostExposure:  "Public",
		GroupID:       uuid.Nil, 
		PostLikeCount: 0,
		CreatedAt:     "2024-01-01T00:00:00Z",
		AuthorID:      userID,
	}

	if err := post.Save(); err != nil {
		t.Fatal("error creating post:", err)
	}

	// Toggle like on the post
	if err := models.TogglePostLike(postID, userID); err != nil {
		t.Fatal("error toggling like:", err)
	}

	// Check that the like was added
	likes, err := models.GetLikesByPostID(postID)
	if err != nil {
		t.Fatal("error getting likes:", err)
	}
	if len(likes) != 1 {
		t.Fatalf("expected 1 like, got %d", len(likes))
	}

	// Toggle like again to remove it
	if err := models.TogglePostLike(postID, userID); err != nil {
		t.Fatal("error toggling like:", err)
	}

	// Check that the like was removed
	likes, err = models.GetLikesByPostID(postID)
	if err != nil {
		t.Fatal("error getting likes:", err)
	}
	if len(likes) != 0 {
		t.Fatalf("expected 0 likes, got %d", len(likes))
	}

	// Clean up test post and user
	if err := post.Del(); err != nil {
		t.Fatal("error deleting post:", err)
	}
	if err := user.Del(); err != nil {
		t.Fatal("error deleting user:", err)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test file:", err)
	}
}
