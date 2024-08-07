package models

import (
	"bonfire/pkgs/utils"

	"github.com/gofrs/uuid"
)

// UserFollowerModel represents the structure of the user_follower table
type UserFollowerModel struct {
	UserID     uuid.UUID `json:"user_id"`
	FollowerID uuid.UUID `json:"follower_id"`
}

// CRUD Operations

// Function to create a follower relationship
func (f *UserFollowerModel) Save() error {
	columns := []string{"user_id", "follower_id"}
	values := []interface{}{f.UserID, f.FollowerID}
	_, err := utils.Create("user_follower", columns, values)
	return err
}

// Function to delete a follower relationship
func (f *UserFollowerModel) Del() error {
	condition := "user_id = ? AND follower_id = ?"
	_, err := utils.Delete("user_follower", condition, f.UserID, f.FollowerID)
	return err
}

// Function to get followers of a user
func GetFollowersByUserID(userID uuid.UUID) ([]UserFollowerModel, error) {
	columns := []string{"user_id", "follower_id"}
	condition := "user_id = ?"
	rows, err := utils.Read("user_follower", columns, condition, userID)
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
