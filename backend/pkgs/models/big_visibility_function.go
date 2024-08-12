package models

import (
	"bonfire/pkgs/storage"
	"github.com/gofrs/uuid"
)

// Function to get all viewable posts that can be seen on feed, arranged by newest date
func GetViewablePosts(userID uuid.UUID) ([]PostModel, error) {
	query := `
	SELECT post_id, post_content, post_image_path, post_exposure, group_id, post_likecount, created_at, author_id
	FROM post
	WHERE (group_id IS NULL OR group_id = ?)
	AND (
		post_exposure = 'public'
		OR (post_exposure = 'private' AND author_id IN (SELECT following_id FROM user_following WHERE user_id = ?))
		OR (post_exposure = 'custom' AND post_id IN (SELECT post_id FROM post_view WHERE user_id = ?))
	)
	ORDER BY created_at DESC`

	rows, err := storage.DB.Query(query, uuid.Nil, userID, userID)
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

// Function to get all public posts
func GetAllPublicPosts() ([]PostModel, error) {
	query := `
	SELECT post_id, post_content, post_image_path, post_exposure, group_id, post_likecount, created_at, author_id
	FROM post
	WHERE post_exposure = 'public'
	ORDER BY created_at DESC`

	rows, err := storage.DB.Query(query)
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


func GetPostsByGroupID(groupID uuid.UUID) ([]PostModel, error) {
	query := `
	SELECT post_id, post_content, post_image_path, post_exposure, group_id, post_likecount, created_at, author_id
	FROM post
	WHERE group_id = ?
	ORDER BY created_at DESC`

	rows, err := storage.DB.Query(query, groupID)
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