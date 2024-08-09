package test

import (
	"testing"

	"golang.org/x/crypto/bcrypt"

	"bonfire/pkgs/utils"
)

func TestHashing(t *testing.T) {
	plain_password := "123123"

	digest, err := utils.HashPassword(plain_password)
	if err != nil {
		t.Fatalf("error hashing password: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(digest), []byte(plain_password)); err != nil {
		t.Fatalf("error comparing passwords: %v", err)
	}
}
