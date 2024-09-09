package models

import (
	"bonfire/pkgs/utils"
	"github.com/gofrs/uuid"
)

// Comment represents a comment made by a user.
type Comment struct {
	CommentID        uuid.UUID `json:"comment_id"`
	AuthorID         uuid.UUID `json:"author_id"`
	PostID           uuid.UUID `json:"post_id"`
	CommentContent   string    `json:"comment_content"`
	IsLiked          bool      `json:"is_liked"`
	CommentLikeCount int       `json:"comment_likecount"`
	CreatedAt        string    `json:"created_at"`
	CommentImagePath string    `json:"comment_image_path"`

	FullUser *UserModel `json:"full_user,omitempty"`
	FullPost *PostModel `json:"full_post,omitempty"`
}

// Save creates or updates a comment in the database.
func (c *Comment) Save() error {
	if c.CommentID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		c.CommentID = uid
	}

	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at", "comment_image_path"}
	values := []interface{}{c.CommentID, c.AuthorID, c.PostID, c.CommentContent, c.CommentLikeCount, c.CreatedAt, c.CommentImagePath}
	_, err := utils.Create("comment", columns, values)
	return err
}

// Del deletes a comment from the database.
func (c *Comment) Del() error {
	condition := "comment_id = ?"
	_, err := utils.Delete("comment", condition, c.CommentID)
	return err
}

// Update updates the fields of an existing comment in the database.
func (c *Comment) Update() error {
	updates := map[string]interface{}{
		"author_id":          c.AuthorID,
		"post_id":            c.PostID,
		"comment_content":    c.CommentContent,
		"comment_likecount":  c.CommentLikeCount,
		"created_at":         c.CreatedAt,
		"comment_image_path": c.CommentImagePath,
	}
	condition := "comment_id = ?"
	_, err := utils.Update("comment", updates, condition, c.CommentID)
	return err
}

// GetCommentsByUserID retrieves comments made by a specific user.
func GetCommentsByUserID(userID uuid.UUID) ([]Comment, error) {
	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at", "comment_image_path"}
	condition := "author_id = ? ORDER BY created_at DESC"
	rows, err := utils.Read("comment", columns, condition, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.CommentID, &comment.AuthorID, &comment.PostID, &comment.CommentContent, &comment.CommentLikeCount, &comment.CreatedAt, &comment.CommentImagePath)
		if err != nil {
			return nil, err
		}
		comment.FullUser, _ = GetUserByID(comment.AuthorID)
		comment.FullPost, _ = GetPostByPostID(comment.PostID)
		comments = append(comments, comment)
	}

	return comments, nil
}

// GetCommentsByPostID retrieves comments associated with a specific post.
func GetCommentsByPostID(postID uuid.UUID) ([]Comment, error) {
	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at", "comment_image_path"}
	condition := "post_id = ?"
	rows, err := utils.Read("comment", columns, condition, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []Comment
	for rows.Next() {
		var comment Comment
		err := rows.Scan(&comment.CommentID, &comment.AuthorID, &comment.PostID, &comment.CommentContent, &comment.CommentLikeCount, &comment.CreatedAt, &comment.CommentImagePath)
		if err != nil {
			return nil, err
		}
		comment.FullUser, _ = GetUserByID(comment.AuthorID)
		comment.FullPost, _ = GetPostByPostID(comment.PostID)
		comments = append(comments, comment)
	}

	return comments, nil
}

// GetCommentByCommentID retrieves a comment by its ID.
func GetCommentByCommentID(commentID uuid.UUID) (*Comment, error) {
	columns := []string{"comment_id", "author_id", "post_id", "comment_content", "comment_likecount", "created_at", "comment_image_path"}
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
	err = rows.Scan(&comment.CommentID, &comment.AuthorID, &comment.PostID, &comment.CommentContent, &comment.CommentLikeCount, &comment.CreatedAt, &comment.CommentImagePath)
	if err != nil {
		return nil, err
	}
	comment.FullUser, _ = GetUserByID(comment.AuthorID)
	comment.FullPost, _ = GetPostByPostID(comment.PostID)

	return &comment, nil
}
