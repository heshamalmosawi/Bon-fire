package models

import (
	"github.com/gofrs/uuid"

	"bonfire/pkgs/utils"
)

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

// GetPostByPostD retrieves a post by its ID.
func GetPostByPostID(postID uuid.UUID) (*PostModel, error) {
	columns := []string{"post_id", "post_content", "post_image_path", "post_exposure", "group_id", "post_likecount", "created_at", "author_id"}
	condition := "post_id = ?"
	rows, err := utils.Read("post", columns, condition, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil
	}

	var post PostModel
	err = rows.Scan(&post.PostID, &post.PostContent, &post.PostImagePath, &post.PostExposure, &post.GroupID, &post.PostLikeCount, &post.CreatedAt, &post.AuthorID)
	if err != nil {
		return nil, err
	}

	return &post, nil
}
