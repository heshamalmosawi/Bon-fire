package models

import (
	"bonfire/pkgs/utils"
	"github.com/gofrs/uuid"
)

// PostModel represents the structure of the post table
type PostModel struct {
	PostID        uuid.UUID `json:"post_id"`
	PostContent   string    `json:"post_content"`
	PostImagePath string    `json:"post_image_path"`
	PostExposure  string    `json:"post_exposure"`
	GroupID       uuid.UUID `json:"group_id"`
	PostLikeCount int       `json:"post_likecount"`
	CreatedAt     string    `json:"created_at"`
	AuthorID      uuid.UUID `json:"author_id"`
}

// CRUD Operations

// Function to create a post
func (p *PostModel) Save() error {
	if p.PostID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		p.PostID = uid
	}

	columns := []string{"post_id", "post_content", "post_image_path", "post_exposure", "group_id", "post_likecount", "created_at", "author_id"}
	values := []interface{}{p.PostID, p.PostContent, p.PostImagePath, p.PostExposure, p.GroupID, p.PostLikeCount, p.CreatedAt, p.AuthorID}
	_, err := utils.Create("post", columns, values)
	return err
}

// Function to delete a post
func (p *PostModel) Del() error {
	condition := "post_id = ?"
	_, err := utils.Delete("post", condition, p.PostID)
	return err
}

// Function to update a post
func (p *PostModel) Update() error {
	updates := map[string]interface{}{
		"post_content":    p.PostContent,
		"post_image_path": p.PostImagePath,
		"post_exposure":   p.PostExposure,
		"group_id":        p.GroupID,
		"post_likecount":  p.PostLikeCount,
		"created_at":      p.CreatedAt,
		"author_id":       p.AuthorID,
	}
	condition := "post_id = ?"
	_, err := utils.Update("post", updates, condition, p.PostID)
	return err
}

// Function to get posts by author ID
func GetPostsByAuthorID(authorID uuid.UUID) ([]PostModel, error) {
	columns := []string{"post_id", "post_content", "post_image_path", "post_exposure", "group_id", "post_likecount", "created_at", "author_id"}
	condition := "author_id = ?"
	rows, err := utils.Read("post", columns, condition, authorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []PostModel
	for rows.Next() {
		var post PostModel
		err := rows.Scan(&post.PostID, &post.PostContent, &post.PostImagePath, &post.PostExposure, &post.GroupID, &post.PostLikeCount, &post.CreatedAt, &post.AuthorID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

// Function to get posts by group ID
func GetPostsByGroupID(groupID uuid.UUID) ([]PostModel, error) {
	columns := []string{"post_id", "post_content", "post_image_path", "post_exposure", "group_id", "post_likecount", "created_at", "author_id"}
	condition := "group_id = ?"
	rows, err := utils.Read("post", columns, condition, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []PostModel
	for rows.Next() {
		var post PostModel
		err := rows.Scan(&post.PostID, &post.PostContent, &post.PostImagePath, &post.PostExposure, &post.GroupID, &post.PostLikeCount, &post.CreatedAt, &post.AuthorID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}
