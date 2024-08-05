package models

import (
	"bonfire/pkgs/utils"

	"github.com/gofrs/uuid"
	"github.com/mattn/go-sqlite3"
)

type UserModel struct {
	UserID          uuid.UUID `json:"user_id"`
	UserEmail       string    `json:"user_email"`
	UserPassword    string    `json:"user_password"`
	UserFirstName   string    `json:"user_fname"`
	UserLastName    string    `json:"user_lname"`
	UserDOB         string    `json:"user_dob"`
	UserAvatarPath  string    `json:"user_avatar_path"`
	UserNickname    string    `json:"user_nickname"`
	UserBio         string    `json:"user_about"`
	ProfileExposure string    `json:"profile_exposure"`
}

// CRUD Operations

// Function to create user

func (u *UserModel) Save() error {
	if u.UserID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		u.UserID = uid
	}

	hashed_password, err := utils.HashPassword(u.UserPassword)
	if err != nil {
		return err
	}

	u.UserPassword = hashed_password

	columns := []string{"user_id", "user_email", "user_password", "user_fname", "user_lname", "user_dob", "user_avatar_path", "user_nickname", "user_about", "profile_exposure"}
	values := []interface{}{u.UserID, u.UserEmail, u.UserPassword, u.UserFirstName, u.UserLastName, u.UserDOB, u.UserAvatarPath, u.UserNickname, u.UserBio, u.ProfileExposure}

	_, err = utils.Create("user", columns, values)
	return err
}

// Method to delete the user
func (u *UserModel) Del() error {
	condition := "user_email = ?"
	_, err := utils.Delete("user", condition, u.UserEmail)
	return err
}

// Method to update the user instance in the database
func (u *UserModel) Update() error {
	updates := map[string]interface{}{
		"user_email":       u.UserEmail,
		"user_fname":       u.UserFirstName,
		"user_lname":       u.UserLastName,
		"user_dob":         u.UserDOB,
		"user_avatar_path": u.UserAvatarPath,
		"user_nickname":    u.UserNickname,
		"user_about":       u.UserBio,
		"profile_exposure": u.ProfileExposure,
	}
	condition := "user_id = ?"
	_, err := utils.Update("user", updates, condition, u.UserID)
	return err
}

// Function to get user by email
func GetUserByEmail(email string) (*UserModel, error) {
	columns := []string{"user_id", "user_email", "user_fname", "user_lname", "user_dob", "user_avatar_path", "user_nickname", "user_about", "profile_exposure"}
	condition := "user_email = ?"
	rows, err := utils.Read("user", columns, condition, email)
	if err != nil {
		if err == sqlite3.ErrNotFound {
			return nil, utils.ErrUserNotFound
		}
		return nil, err
	}
	defer rows.Close()

	var user UserModel
	if rows.Next() {
		err := rows.Scan(&user.UserID, &user.UserEmail, &user.UserFirstName, &user.UserLastName, &user.UserDOB, &user.UserAvatarPath, &user.UserNickname, &user.UserBio, &user.ProfileExposure)
		if err != nil {
			return nil, err
		}
	}

	return &user, nil
}
