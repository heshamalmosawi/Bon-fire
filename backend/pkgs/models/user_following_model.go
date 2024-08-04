package models

import (
	"bonfire/pkgs/utils"
	"github.com/gofrs/uuid"
)

// UserFollowingModel represents the structure of the user_following table
type UserFollowingModel struct {
	UserID      uuid.UUID `json:"user_id"`
	FollowingID uuid.UUID `json:"following_id"`
}

// CRUD Operations

// Function to create a following relationship
func (f *UserFollowingModel) Save() error {
	columns := []string{"user_id", "following_id"}
	values := []interface{}{f.UserID, f.FollowingID}
	_, err := utils.Create("user_following", columns, values)
	return err
}

// Function to delete a following relationship
func (f *UserFollowingModel) Del() error {
	condition := "user_id = ? AND following_id = ?"
	_, err := utils.Delete("user_following", condition, f.UserID, f.FollowingID)
	return err
}

// Function to get followings of a user
func GetFollowingsByUserID(userID uuid.UUID) ([]UserFollowingModel, error) {
	columns := []string{"user_id", "following_id"}
	condition := "user_id = ?"
	rows, err := utils.Read("user_following", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followings []UserFollowingModel
	for rows.Next() {
		var following UserFollowingModel
		err := rows.Scan(&following.UserID, &following.FollowingID)
		if err != nil {
			return nil, err
		}
		followings = append(followings, following)
	}

	return followings, nil
}
