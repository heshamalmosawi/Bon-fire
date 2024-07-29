package models

import (
	"bonfire/pkgs/storage"
	"time"

	"github.com/gofrs/uuid"
)

type UserModel struct {
	UserID         uuid.UUID `json:"user_id"`
	UserEmail      string    `json:"user_email"`
	UserPassword   string    `json:"user_password"`
	UserFirstName  string    `json:"user_fname"`
	UserLastName   string    `json:"user_lname"`
	UserDOB        time.Time `json:"user_dob"`
	UserAvatarPath string    `json:"user_avatar_path"`
	UserNickname   string    `json:"user_nickname"`
	UserBio        string    `json:"user_bio"`
}


//CRUD Operations 

//Function to create user
func CreateUser(user *UserModel) error {
	query := `INSERT INTO users (user_id, user_email, user_password, user_fname, user_lname, user_dob, user_avatar_path, user_nickname, user_bio)
	          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	user.UserID = uuid.Must(uuid.NewV4()) // Generate a new UUID for the user

	_, err := storage.DB.Exec(query, user.UserID, user.UserEmail, user.UserPassword, user.UserFirstName, user.UserLastName, user.UserDOB, user.UserAvatarPath, user.UserNickname, user.UserBio)
	return err
}

//function to delete 
func DeleteUser(userID uuid.UUID) error {
	query := `DELETE FROM users WHERE user_id = ?`

	_, err := storage.DB.Exec(query, userID)
	return err
}

//function to update - alternative would be to update directly form the object type 
// TODO : discuss 
func UpdateUser(user *UserModel) error {
	query := `UPDATE users SET user_email = ?, user_password = ?, user_fname = ?, user_lname = ?, user_dob = ?, user_avatar_path = ?, user_nickname = ?, user_bio = ?
	          WHERE user_id = ?`

	_, err := storage.DB.Exec(query, user.UserEmail, user.UserPassword, user.UserFirstName, user.UserLastName, user.UserDOB, user.UserAvatarPath, user.UserNickname, user.UserBio, user.UserID)
	return err
}

// get User function
func GetUserByEmail(email string) (*UserModel, error) {
	query := `SELECT user_id, user_email, user_password, user_fname, user_lname, user_dob, user_avatar_path, user_nickname, user_bio FROM users WHERE user_email = ?`

	row := storage.DB.QueryRow(query, email)

	var user UserModel
	err := row.Scan(&user.UserID, &user.UserEmail, &user.UserPassword, &user.UserFirstName, &user.UserLastName, &user.UserDOB, &user.UserAvatarPath, &user.UserNickname, &user.UserBio)
	if err != nil {
		return nil, err
	}

	return &user, nil
}