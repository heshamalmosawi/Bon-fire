package test

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/storage"
	"os"
	"testing"
)

func TestUserCRUD(t *testing.T) {
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

	user.UserNickname = "testuserii"

	if err := user.Update(); err != nil {
		t.Fatal("error updating user:", err)
	}

	if err := user.Del(); err != nil {
		t.Fatal("error deleting user:", err)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test.db file:", err)
	}
}
