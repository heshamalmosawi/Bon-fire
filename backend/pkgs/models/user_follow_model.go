package models

import (
	"database/sql"
	// "log"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/utils"
)

// UserFollowModel represents the structure of the user_follow table
type UserFollowModel struct {
	UserID     uuid.UUID `json:"user_id"`
	FollowerID uuid.UUID `json:"follower_id"`
}

// CRUD Operations

// Function to create a follower relationship
func (f *UserFollowModel) Save() error {
	columns := []string{"user_id", "follower_id"}
	values := []interface{}{f.UserID, f.FollowerID}
	_, err := utils.Create("user_follow", columns, values)
	return err
}

// Function to delete a follower relationship
func (f *UserFollowModel) Del() error {
	condition := "user_id = ? AND follower_id = ?"
	_, err := utils.Delete("user_follow", condition, f.UserID, f.FollowerID)
	return err
}

// Function to get followers of a user
func GetFollowersByUserID(userID uuid.UUID) ([]UserFollowModel, error) {
	columns := []string{"user_id", "follower_id"}
	condition := "user_id = ?"
	rows, err := utils.Read("user_follow", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followers []UserFollowModel
	for rows.Next() {
		var follower UserFollowModel
		err := rows.Scan(&follower.UserID, &follower.FollowerID)
		if err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}

	return followers, nil
}

// Function to get followings of a user
func GetFollowingsByUserID(userID uuid.UUID) ([]UserFollowModel, error) {
	columns := []string{"user_id", "follower_id"}
	condition := "follower_id = ?"
	rows, err := utils.Read("user_follow", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followings []UserFollowModel
	for rows.Next() {
		var following UserFollowModel
		err := rows.Scan(&following.FollowerID, &following.UserID)
		if err != nil {
			return nil, err
		}
		followings = append(followings, following)
	}

	return followings, nil
}

// Function to get single user following
func GetFollowingUser(user uuid.UUID, follower uuid.UUID) (UserFollowModel, error) {
	columns := []string{"user_id", "follower_id"}
	condition := "user_id = ? AND follower_id = ?"
	rows, err := utils.Read("user_follow", columns, condition, user, follower)
	if err != nil {
		return UserFollowModel{}, err
	}
	defer rows.Close()

	var followingUser UserFollowModel
	for rows.Next() {
		err := rows.Scan(&followingUser.UserID, &followingUser.FollowerID)
		if err != nil {
			return UserFollowModel{}, err
		}
	}
	// if no rows are returned
	if followingUser.UserID == uuid.Nil {
		return UserFollowModel{}, sql.ErrNoRows
	}

	return followingUser, nil
}

// Function to see if the user is a follower of the other user
func IsFollower(userID uuid.UUID, followerID uuid.UUID) (bool, error) {
	columns := []string{"user_id", "follower_id"}
	condition := "user_id = ? AND follower_id = ?"
	rows, err := utils.Read("user_follow", columns, condition, userID, followerID)
	if err != nil {
		return false, err
	}
	defer rows.Close()
	return rows.Next(), nil
}

// Function to see if the user is a followeing of the other user
func IsFollowing(userID uuid.UUID, followerID uuid.UUID) (bool, error) {
	columns := []string{"user_id", "follower_id"}
	condition := "user_id = ? AND follower_id = ?"
	rows, err := utils.Read("user_follow", columns, condition, followerID, userID)
	if err != nil {
		return false, err
	}
	defer rows.Close()
	return rows.Next(), nil
}