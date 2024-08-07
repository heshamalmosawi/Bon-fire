package models

import (
	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"

	"github.com/gofrs/uuid"
)

// PostLikeModel represents the structure of the post_like table
type PostLikeModel struct {
	ListingID uuid.UUID `json:"listing_id"`
	PostID    uuid.UUID `json:"post_id"`
	UserID    uuid.UUID `json:"user_id"`
}

// CRUD Operations

// Function to create a post like
func (pl *PostLikeModel) Save() error {
	if pl.ListingID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		pl.ListingID = uid
	}

	columns := []string{"listing_id", "post_id", "user_id"}
	values := []interface{}{pl.ListingID, pl.PostID, pl.UserID}
	_, err := utils.Create("post_like", columns, values)
	return err
}

// Function to delete a post like
func (pl *PostLikeModel) Del() error {
	condition := "listing_id = ?"
	_, err := utils.Delete("post_like", condition, pl.ListingID)
	return err
}

// Function to get likes by post ID
func GetLikesByPostID(postID uuid.UUID) ([]PostLikeModel, error) {
	columns := []string{"listing_id", "post_id", "user_id"}
	condition := "post_id = ?"
	rows, err := utils.Read("post_like", columns, condition, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var likes []PostLikeModel
	for rows.Next() {
		var like PostLikeModel
		err := rows.Scan(&like.ListingID, &like.PostID, &like.UserID)
		if err != nil {
			return nil, err
		}
		likes = append(likes, like)
	}

	return likes, nil
}

// Function to get likes by user ID
func GetLikesByUserID(userID uuid.UUID) ([]PostLikeModel, error) {
	columns := []string{"listing_id", "post_id", "user_id"}
	condition := "user_id = ?"
	rows, err := utils.Read("post_like", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var likes []PostLikeModel
	for rows.Next() {
		var like PostLikeModel
		err := rows.Scan(&like.ListingID, &like.PostID, &like.UserID)
		if err != nil {
			return nil, err
		}
		likes = append(likes, like)
	}

	return likes, nil
}

// Function to toggle like
func ToggleLike(postID, userID uuid.UUID) error {
	like, err := GetLikeByPostAndUser(postID, userID)
	if err != nil {
		return err
	}

	if like != nil {
		return like.Del()
	}

	newLike := PostLikeModel{
		PostID: postID,
		UserID: userID,
	}

	return newLike.Save()
}

// Function to get like by post ID and user ID
func GetLikeByPostAndUser(postID, userID uuid.UUID) (*PostLikeModel, error) {
	columns := []string{"listing_id", "post_id", "user_id"}
	condition := "post_id = ? AND user_id = ?"
	rows, err := utils.Read("post_like", columns, condition, postID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		var like PostLikeModel
		err := rows.Scan(&like.ListingID, &like.PostID, &like.UserID)
		if err != nil {
			return nil, err
		}
		return &like, nil
	}

	return nil, nil
}

//to display
func GetNumberOfLikesByPostID(postID uuid.UUID) (int, error) {
	query := "SELECT COUNT(*) FROM post_like WHERE post_id = ?"
	row := storage.DB.QueryRow(query, postID)
	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}