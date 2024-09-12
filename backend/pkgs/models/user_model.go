package models

import (
	"github.com/gofrs/uuid"
	"github.com/mattn/go-sqlite3"

	"bonfire/pkgs/utils"
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
	IsFollowed      bool      `json:"is_followed"`
	IsReuested      bool      `json:"is_requested"`
	IsInvited 		bool 	`json:"is_invited"`
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
	columns := []string{"user_id", "user_email", "user_password", "user_fname", "user_lname", "user_dob", "user_avatar_path", "user_nickname", "user_about", "profile_exposure"}
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
		err := rows.Scan(&user.UserID, &user.UserEmail, &user.UserPassword, &user.UserFirstName, &user.UserLastName, &user.UserDOB, &user.UserAvatarPath, &user.UserNickname, &user.UserBio, &user.ProfileExposure)
		if err != nil {
			return nil, err
		}
	}

	return &user, nil
}

// This function gets the user by user UUID
func GetUserByID(uid uuid.UUID) (*UserModel, error) {
	columns := []string{"user_id", "user_email", "user_fname", "user_lname", "user_dob", "user_avatar_path", "user_nickname", "user_about", "profile_exposure"}
	condition := "user_id = ?"
	rows, err := utils.Read("user", columns, condition, uid)
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

// Function to get all users
func GetAllUsers() ([]UserModel, error) {
	columns := []string{"user_id", "user_email", "user_fname", "user_lname", "user_dob", "user_avatar_path", "user_nickname", "user_about", "profile_exposure"}
	condition := ""
	rows, err := utils.Read("user", columns, condition)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []UserModel
	for rows.Next() {
		var user UserModel
		err := rows.Scan(&user.UserID, &user.UserEmail, &user.UserFirstName, &user.UserLastName, &user.UserDOB, &user.UserAvatarPath, &user.UserNickname, &user.UserBio, &user.ProfileExposure)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func GetMessagersList(user uuid.UUID) ([]UserModel, error) {
	columns := []string{"uf.user_id AS other_user_id, u.user_fname, u.user_lname, u.user_avatar_path, u.profile_exposure AS last_chat_timestamp"}
	joinTable := "user_follow uf JOIN user u ON u.user_id = uf.user_id LEFT JOIN private_message c ON ((c.sender_id = uf.user_id AND c.recipient_id = ?) OR (c.sender_id = ? AND c.recipient_id = uf.user_id))"
	condition := "uf.follower_id = ? OR uf.user_id = ? GROUP BY uf.user_id, u.user_fname, u.user_lname, u.user_avatar_path ORDER BY COALESCE(MAX(c.message_timestamp), '1970-01-01') DESC;"
	rows, err := utils.Read(joinTable, columns, condition, user, user, user, user)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []UserModel
	for rows.Next() {
		var user UserModel
		err := rows.Scan(&user.UserID, &user.UserFirstName, &user.UserLastName, &user.UserAvatarPath, &user.ProfileExposure)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func IsMessaged(user1, user2 uuid.UUID) (bool, error) {
	condition := "sender_id = ? AND recipient_id = ? OR sender_id = ? AND recipient_id = ?"
	rows, err := utils.Read("private_message", []string{"message_id"}, condition, user1, user2, user2, user1)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	if rows.Next() {
		return true, nil
	}

	return false, nil
}