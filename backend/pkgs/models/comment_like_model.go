package models

import (
	"github.com/gofrs/uuid"

	// "bonfire/pkgs/storage"
	"bonfire/pkgs/utils"
)

// CommentLikeModel represents the structure of the comment_like table
type CommentLikeModel struct {
	ListingID uuid.UUID `json:"listing_id"`
	CommentID uuid.UUID `json:"comment_id"`
	UserID    uuid.UUID `json:"user_id"`
}

// Save creates a new comment like
func (cl *CommentLikeModel) Save() error {
	if cl.ListingID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		cl.ListingID = uid
	}

	columns := []string{"listing_id", "comment_id", "user_id"}
	values := []interface{}{cl.ListingID, cl.CommentID, cl.UserID}
	_, err := utils.Create("comment_like", columns, values)
	return err
}

// Del deletes a comment like
func (cl *CommentLikeModel) Del() error {
	condition := "listing_id = ?"
	_, err := utils.Delete("comment_like", condition, cl.ListingID)
	return err
}



// GetLikesByCommentID retrieves likes by comment ID
func GetLikesByCommentID(commentID uuid.UUID) ([]CommentLikeModel, error) {
	columns := []string{"listing_id", "comment_id", "user_id"}
	condition := "comment_id = ?"
	rows, err := utils.Read("comment_like", columns, condition, commentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var likes []CommentLikeModel
	for rows.Next() {
		var like CommentLikeModel
		err := rows.Scan(&like.ListingID, &like.CommentID, &like.UserID)
		if err != nil {
			return nil, err
		}
		likes = append(likes, like)
	}

	return likes, nil
}

// GetLikeByCommentAndUser retrieves a like by comment ID and user ID
func GetLikeByCommentAndUser(commentID, userID uuid.UUID) (*CommentLikeModel, error) {
	columns := []string{"listing_id", "comment_id", "user_id"}
	condition := "comment_id = ? AND user_id = ?"
	rows, err := utils.Read("comment_like", columns, condition, commentID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil
	}

	var like CommentLikeModel
	err = rows.Scan(&like.ListingID, &like.CommentID, &like.UserID)
	if err != nil {
		return nil, err
	}

	return &like, nil
}

// GetLikesByCommentID retrieves likes by user ID
func GetLikeByUserID(userID uuid.UUID) ([]CommentLikeModel, error) {
	columns := []string{"listing_id", "comment_id", "user_id"}
	condition := "user_id = ?"
	rows, err := utils.Read("comment_like", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var likes []CommentLikeModel
	for rows.Next() {
		var like CommentLikeModel
		err := rows.Scan(&like.ListingID, &like.CommentID, &like.UserID)
		if err != nil {
			return nil, err
		}
		likes = append(likes, like)
	}

	return likes, nil
}

// ToggleLike toggles a like for a comment
func ToggleCommentLike(commentID, userID uuid.UUID) error {
	like, err := GetLikeByCommentAndUser(commentID, userID)
	if err != nil {
		return err
	}

	if like != nil {
		return like.Del()
	}

	newLike := CommentLikeModel{
		ListingID: uuid.Must(uuid.NewV4()),
		CommentID: commentID,
		UserID:    userID,
	}

	return newLike.Save()
}

// to display comment likes count
func GetCommentLikeCount(commentID uuid.UUID) (int, error) {
	columns := []string{"listing_id", "comment_id", "user_id"}
	condition := "comment_id = ?"
	rows, err := utils.Read("comment_like", columns, condition, commentID)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		count++
	}

	return count, nil
}
