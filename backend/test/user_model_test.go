package main

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

	err := models.CreateUser(&user)

	if err != nil {
		t.Fatal("error creating user:", err)
	}

	err = models.DeleteUser("test@example.com")

	if err != nil {
		t.Fatal("error deleting user:", err)
	}

	if err := os.Remove("test.db"); err != nil {
		t.Fatal("error removing test.db file:", err)
	}
}
