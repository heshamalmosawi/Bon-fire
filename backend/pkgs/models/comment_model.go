package models

import (
	"github.com/gofrs/uuid"

	"bonfire/pkgs/utils"
)

// Comment represents a comment made by a user.
type Comment struct {
	CommentID        uuid.UUID `json:"comment_id"`
	AuthorID         uuid.UUID `json:"author_id"`
	PostID           uuid.UUID `json:"post_id"`
	CommentContent   string    `json:"comment_content"`
	CommentLikeCount int       `json:"comment_likecount"`
	CreatedAt        string    `json:"created_at"`
}

// CRUD Operations

// Function to create a comment
func (c *Comment) Save() error {
	if c.CommentID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		c.CommentID = uid
	}

	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at"}
	values := []interface{}{c.CommentID, c.AuthorID, c.PostID, c.CommentContent, c.CommentLikeCount, c.CreatedAt}
	_, err := utils.Create("comment", columns, values)
	return err
}

// Function to delete a commnet
func (c *Comment) Del() error {
	condition := "comment_id = ?"
	_, err := utils.Delete("comment", condition, c.CommentID)
	return err
}

// Function to update a comment
func (c *Comment) Update() error {
	updates := map[string]interface{}{
		"author_id":       c.AuthorID,
		"post_id":         c.PostID,
		"comment_content": c.CommentContent,
		"comment_likecount": c.CommentLikeCount,
		"created_at":      c.CreatedAt,
	}
	condition := "comment_id = ?"
	_, err := utils.Update("comment", updates, condition, c.CommentID)
	return err
}

// GetCommentsByUserID retrieves comments made by a specific user.
func GetCommentsByUserID(userID uuid.UUID) ([]Comment, error) {
	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at"}
	condition := "author_id = ?"
	rows, err := utils.Read("comment", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.CommentID, &comment.AuthorID, &comment.PostID, &comment.CommentContent, &comment.CommentLikeCount, &comment.CreatedAt)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

func GetCommentsByPostID(postID uuid.UUID) ([]Comment, error) {
	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at"}
	condition := "post_id = ?"
	rows, err := utils.Read("comment", columns, condition, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.CommentID, &comment.AuthorID, &comment.PostID, &comment.CommentContent, &comment.CommentLikeCount, &comment.CreatedAt)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}


// GetCommentByCommentID retrieves a comment by its ID.
func GetCommentByCommentID(commentID uuid.UUID) (*Comment, error) {
	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at"}
	condition := "comment_id = ?"
	rows, err := utils.Read("comment", columns, condition, commentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil
	}

	var comment Comment
	err = rows.Scan(&comment.CommentID, &comment.AuthorID, &comment.PostID, &comment.CommentContent, &comment.CommentLikeCount, &comment.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &comment, nil
}


