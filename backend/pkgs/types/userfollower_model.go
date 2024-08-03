package models

import (
	"bonfire/pkgs/storage"

	"github.com/gofrs/uuid"
)

// UserFollowerModel represents the structure of the user_follower table
type UserFollowerModel struct {
	UserID     uuid.UUID `json:"user_id"`
	FollowerID uuid.UUID `json:"follower_id"`
}

// CRUD Operations

// Function to create a follower relationship
func CreateUserFollower(follower *UserFollowerModel) error {
	query := `INSERT INTO user_follower (user_id, follower_id)
	          VALUES (?, ?)`

	_, err := storage.DB.Exec(query, follower.UserID, follower.FollowerID)
	return err
}

// Function to delete a follower relationship
func DeleteUserFollower(userID, followerID uuid.UUID) error {
	query := `DELETE FROM user_follower WHERE user_id = ? AND follower_id = ?`

	_, err := storage.DB.Exec(query, userID, followerID)
	return err
}

// Function to get followers of a user
func GetFollowersByUserID(userID uuid.UUID) ([]UserFollowerModel, error) {
	query := `SELECT user_id, follower_id FROM user_follower WHERE user_id = ?`

	rows, err := storage.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followers []UserFollowerModel
	for rows.Next() {
		var follower UserFollowerModel
		err := rows.Scan(&follower.UserID, &follower.FollowerID)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}

	return followers, nil
}
