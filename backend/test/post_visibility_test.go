package test

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/storage"
	"os"
	"testing"

	"github.com/gofrs/uuid"
)

func TestPostVisibility(t *testing.T) {
	storage.InitDB("test")

	// Create test users
	user1ID, _ := uuid.NewV4()
	user2ID, _ := uuid.NewV4()
	user3ID, _ := uuid.NewV4()

	user1 := models.UserModel{
		UserID:          user1ID,
		UserEmail:       "user1@example.com",
		UserPassword:    "password1",
		UserFirstName:   "John",
		UserLastName:    "Doe",
		UserDOB:         "24/10/1990",
		UserAvatarPath:  "/path/to/avatar1",
		UserNickname:    "user1",
		UserBio:         "User 1 Bio",
		ProfileExposure: "Private",
	}

	user2 := models.UserModel{
		UserID:          user2ID,
		UserEmail:       "user2@example.com",
		UserPassword:    "password2",
		UserFirstName:   "Jane",
		UserLastName:    "Doe",
		UserDOB:         "24/10/1991",
		UserAvatarPath:  "/path/to/avatar2",
		UserNickname:    "user2",
		UserBio:         "User 2 Bio",
		ProfileExposure: "Private",
	}

	user3 := models.UserModel{
		UserID:          user3ID,
		UserEmail:       "user3@example.com",
		UserPassword:    "password3",
		UserFirstName:   "Jim",
		UserLastName:    "Beam",
		UserDOB:         "24/10/1992",
		UserAvatarPath:  "/path/to/avatar3",
		UserNickname:    "user3",
		UserBio:         "User 3 Bio",
		ProfileExposure: "Private",
	}

	if err := user1.Save(); err != nil {
		t.Fatal("error creating user1:", err)
	}
	if err := user2.Save(); err != nil {
		t.Fatal("error creating user2:", err)
	}
	if err := user3.Save(); err != nil {
		t.Fatal("error creating user3:", err)
	}

	// Create test posts
	post1ID, _ := uuid.NewV4()
	post2ID, _ := uuid.NewV4()
	post3ID, _ := uuid.NewV4()

	// Public post by user1
	post1 := models.PostModel{
		PostID:        post1ID,
		PostContent:   "Public post by user1",
		PostImagePath: "/path/to/image1",
		PostExposure:  "Public",
		GroupID:       uuid.Nil,
		PostLikeCount: 0,
		CreatedAt:     "2024-01-01T00:00:00Z",
		AuthorID:      user1ID,
	}

	// Private post by user2
	post2 := models.PostModel{
		PostID:        post2ID,
		PostContent:   "Private post by user2",
		PostImagePath: "/path/to/image2",
		PostExposure:  "Private",
		GroupID:        uuid.Nil,
		PostLikeCount: 0,
		CreatedAt:     "2024-01-02T00:00:00Z",
		AuthorID:      user2ID,
	}

	// Custom post by user3
	post3 := models.PostModel{
		PostID:        post3ID,
		PostContent:   "Custom post by user3",
		PostImagePath: "/path/to/image3",
		PostExposure:  "Custom",
		GroupID:       uuid.Nil,
		PostLikeCount: 0,
		CreatedAt:     "2024-01-03T00:00:00Z",
		AuthorID:      user3ID,
	}

	if err := post1.Save(); err != nil {
		t.Fatal("error creating post1:", err)
	}
	if err := post2.Save(); err != nil {
		t.Fatal("error creating post2:", err)
	}
	if err := post3.Save(); err != nil {
		t.Fatal("error creating post3:", err)
	}

	// Create custom views for post3
	if err := models.CreatePostViewsForUsers(post3ID, []uuid.UUID{user1ID, user2ID}); err != nil {
		t.Fatal("error creating post views for post3:", err)
	}

	// User1 follows user2
	follow := models.UserFollowModel{
		UserID:      user2ID,
		FollowerID: user1ID,
	}
	if err := follow.Save(); err != nil {
		t.Fatal("error creating follow relationship:", err)
	}

	// Test for user1 visibility
	posts, err := models.GetViewablePosts(user1ID)
	if err != nil {
		t.Fatal("error getting viewable posts for user1:", err)
	}
	if len(posts) != 3 {
		t.Fatalf("expected 3 posts for user1, got %d %v", len(posts), posts)		
	}

	// Test for user2 visibility
	posts, err = models.GetViewablePosts(user2ID)
	if err != nil {
		t.Fatal("error getting viewable posts for user2:", err)
	}
	if len(posts) != 2 {
		t.Fatalf("expected 2 posts for user2, got %d", len(posts))
	}

	// Test for user3 visibility
	posts, err = models.GetViewablePosts(user3ID)
	if err != nil {
		t.Fatal("error getting viewable posts for user3:", err)
	}
	if len(posts) != 1 {
		t.Fatalf("expected 1 post for user3, got %d", len(posts))
	}

	// Clean up
	if err := post1.Del(); err != nil {
		t.Fatal("error deleting post1:", err)
	}
	if err := post2.Del(); err != nil {
		t.Fatal("error deleting post2:", err)
	}
	if err := post3.Del(); err != nil {
		t.Fatal("error deleting post3:", err)
	}
	if err := user1.Del(); err != nil {
		t.Fatal("error deleting user1:", err)
	}
	if err := user2.Del(); err != nil {
		t.Fatal("error deleting user2:", err)
	}
	if err := user3.Del(); err != nil {
		t.Fatal("error deleting user3:", err)
	}
	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test.db file:", err)
	}
}
