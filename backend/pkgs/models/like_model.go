package models

import (
	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"
	"fmt"
	"log"

	"github.com/gofrs/uuid"
)

// LikeModel represents the structure of the likes table
type LikeModel struct {
	LikeID    uuid.UUID `json:"like_id"`
	PostID    uuid.UUID `json:"post_id"`
	CommentID uuid.UUID `json:"comment_id"`
	UserID    uuid.UUID `json:"user_id"`
}

// CRUD Operations

func (l *LikeModel) Save() error {
	if l.LikeID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		l.LikeID = uid
	}

	columns := []string{"like_id", "post_id", "comment_id", "user_id"}
	values := []interface{}{l.LikeID, l.PostID, l.CommentID, l.UserID}
	_, err := utils.Create("likes", columns, values)
	return err
}

func (l *LikeModel) Del() error {
	condition := "like_id = ?"
	_, err := utils.Delete("likes", condition, l.LikeID)
	return err
}

// -------------------- POST LIKES --------------------

// Function to get likes by post ID
func GetLikesByPostID(postID uuid.UUID) ([]LikeModel, error) {
	columns := []string{"like_id", "post_id", "user_id"}
	condition := "post_id = ?"
	rows, err := utils.Read("likes", columns, condition, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var likes []LikeModel
	for rows.Next() {
		var like LikeModel
		err := rows.Scan(&like.LikeID, &like.PostID, &like.UserID)
		if err != nil {
			return nil, err
		}
		likes = append(likes, like)
	}

	return likes, nil
}

// Function to get likes by user ID
func GetPostLikesByUserID(userID uuid.UUID) ([]LikeModel, error) {
	columns := []string{"like_id", "post_id", "user_id"}
	condition := "user_id = ?"
	rows, err := utils.Read("likes", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var likes []LikeModel
	for rows.Next() {
		var like LikeModel
		err := rows.Scan(&like.LikeID, &like.PostID, &like.UserID)
		if err != nil {
			return nil, err
		}
		likes = append(likes, like)
	}

	return likes, nil
}

// Function to toggle like
func TogglePostLike(postID, userID uuid.UUID) error {
	like, err := GetLikeByPostAndUser(postID, userID)
	if err != nil {
		return err
	}

	if like != nil {
		if err := ChangePostLike(postID, -1); err != nil {
			return err
		}
		return like.Del()
	}

	newLike := LikeModel{
		PostID: postID,
		UserID: userID,
	}

	if err := ChangePostLike(postID, 1); err != nil {
		return err
	}
	return newLike.Save()
}

// Function to get like by post ID and user ID
func GetLikeByPostAndUser(postID, userID uuid.UUID) (*LikeModel, error) {
	columns := []string{"like_id", "post_id", "user_id"}
	condition := "post_id = ? AND user_id = ? AND comment_id = '00000000-0000-0000-0000-000000000000'"
	rows, err := utils.Read("likes", columns, condition, postID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		var like LikeModel
		err := rows.Scan(&like.LikeID, &like.PostID, &like.UserID)
		if err != nil {
			return nil, err
		}
		return &like, nil
	}

	return nil, nil
}

// to display
func GetNumberOfLikesByPostID(postID uuid.UUID) (int, error) {
	query := "SELECT COUNT(*) FROM likes WHERE post_id = ?"
	row := storage.DB.QueryRow(query, postID)
	var count int
	err := row.Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// -------------------- COMMENT LIKES --------------------

// GetLikesByCommentID retrieves likes by comment ID
func GetLikesByCommentID(commentID uuid.UUID) ([]LikeModel, error) {
	columns := []string{"like_id", "comment_id", "user_id"}
	condition := "comment_id = ?"
	rows, err := utils.Read("likes", columns, condition, commentID)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	defer rows.Close()

	var likes []LikeModel
	for rows.Next() {
		var like LikeModel
		err := rows.Scan(&like.LikeID, &like.CommentID, &like.UserID)
		if err != nil {
			log.Print(err)
			return nil, err
		}
		likes = append(likes, like)
	}

	return likes, nil
}

// GetLikeByCommentAndUser retrieves a like by comment ID and user ID
func GetLikeByCommentAndUser(commentID, userID uuid.UUID) (*LikeModel, error) {
	columns := []string{"like_id", "comment_id", "user_id"}
	condition := "comment_id = ? AND user_id = ?"
	rows, err := utils.Read("likes", columns, condition, commentID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil
	}

	var like LikeModel
	err = rows.Scan(&like.LikeID, &like.CommentID, &like.UserID)
	if err != nil {
		return nil, err
	}

	return &like, nil
}

// GetLikesByCommentID retrieves likes by user ID
func GetCommentLikeByUserID(userID uuid.UUID) ([]LikeModel, error) {
	columns := []string{"like_id", "comment_id", "user_id"}
	condition := "user_id = ?"
	rows, err := utils.Read("likes", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var likes []LikeModel
	for rows.Next() {
		var like LikeModel
		err := rows.Scan(&like.LikeID, &like.CommentID, &like.UserID)
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
		if err := ChangeCommentLike(commentID, -1); err != nil {
			return err
		}
		return like.Del()
	}

	newLike := LikeModel{
		LikeID:    uuid.Must(uuid.NewV4()),
		CommentID: commentID,
		UserID:    userID,
	}

	if err := ChangeCommentLike(commentID, 1); err != nil {
		return err
	}
	return newLike.Save()
}

// to display comment likes count TODO: Remove this after trigger implementation
func GetCommentLikeCount(commentID uuid.UUID) (int, error) {
	columns := []string{"like_id", "comment_id", "user_id"}
	condition := "comment_id = ?"
	rows, err := utils.Read("likes", columns, condition, commentID)
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

func ChangePostLike(postID uuid.UUID, inc int) error {
	post, err := GetPostByPostID(postID)
	if err != nil {
		return err
	}

	post.PostLikeCount = post.PostLikeCount + inc

	return post.Update()
}

func ChangeCommentLike(commentID uuid.UUID, inc int) error {
	comment, err := GetCommentByCommentID(commentID)
	if err != nil {
		return err
	}

	comment.CommentLikeCount = comment.CommentLikeCount + inc

	return comment.Update()
}

func GetIsPostLiked(postID, userID uuid.UUID) (bool, error) {
	like_model, err := GetLikeByPostAndUser(postID, userID)
	if err != nil {
		return false, err
	}
	fmt.Println(like_model)


	return like_model != nil, nil
}

func GetIsCommentLiked(commentID, userID uuid.UUID) (bool, error) {
	like_model, err := GetLikeByCommentAndUser(commentID, userID)
	if err != nil {
		return false, err
	}

	return like_model != nil, nil
}