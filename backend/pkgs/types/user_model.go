package models

import (
	"bonfire/pkgs/storage"
	"time"
)

type UserModel struct {
	UserID         string    `json:"user_id"`
	UserEmail      string    `json:"user_email"`
	UserPassword   string    `json:"user_password"`
	UserFirstName  string    `json:"user_fname"`
	UserLastName   string    `json:"user_lname"`
	UserDOB        time.Time `json:"user_dob"`
	UserAvatarPath string    `json:"user_avatar_path"`
	UserNickname   string    `json:"user_nickname"`
	UserBio        string    `json:"user_bio"`
}

// CRUD Operations

// Function to create user
func CreateUser(user *UserModel) error {
	query := `INSERT INTO user (user_email, user_password, user_fname, user_lname, user_dob, user_avatar_path, user_nickname, user_bio)
	          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := storage.DB.Exec(query, user.UserEmail, user.UserPassword, user.UserFirstName, user.UserLastName, user.UserDOB, user.UserAvatarPath, user.UserNickname, user.UserBio)
	return err
}

// Function to delete user by email
func DeleteUser(email string) error {
	query := `DELETE FROM user WHERE user_email = ?`

	_, err := storage.DB.Exec(query, email)
	return err
}

// Function to update user
func UpdateUser(user *UserModel) error {
	query := `UPDATE user SET user_email = ?, user_password = ?, user_fname = ?, user_lname = ?, user_dob = ?, user_avatar_path = ?, user_nickname = ?, user_bio = ?
	          WHERE user_id = ?`

	_, err := storage.DB.Exec(query, user.UserEmail, user.UserPassword, user.UserFirstName, user.UserLastName, user.UserDOB, user.UserAvatarPath, user.UserNickname, user.UserBio, user.UserID)
	return err
}

// Function to get user by email
func GetUserByEmail(email string) (*UserModel, error) {
	query := `SELECT user_id, user_email, user_password, user_fname, user_lname, user_dob, user_avatar_path, user_nickname, user_bio FROM user WHERE user_email = ?`

	row := storage.DB.QueryRow(query, email)

	var user UserModel
	err := row.Scan(&user.UserID, &user.UserEmail, &user.UserPassword, &user.UserFirstName, &user.UserLastName, &user.UserDOB, &user.UserAvatarPath, &user.UserNickname, &user.UserBio)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
