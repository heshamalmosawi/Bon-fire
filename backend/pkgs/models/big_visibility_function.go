package models

import (
	"log"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/storage"
)

func GetViewablePosts(userID uuid.UUID) ([]PostModel, error) {
    query := `
    SELECT post_id, post_content, post_image_path, post_exposure, group_id, post_likecount, created_at, author_id
    FROM post
    WHERE 
    (
        author_id = ?
        OR post_exposure = 'Public'
        OR (post_exposure = 'Private' AND author_id IN (SELECT user_id FROM user_follow WHERE follower_id = ?))
        OR (post_exposure = 'Custom' AND (post_id IN (SELECT post_id FROM post_view WHERE user_id = ?) OR author_id = ?))
    )
    AND (group_id IS NULL OR group_id = ?)
    ORDER BY created_at DESC`

    rows, err := storage.DB.Query(query, userID, userID, userID, userID, uuid.Nil)
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
        post.Author, err = GetUserByID(post.AuthorID)
        if err != nil {
            return nil, err
        }

        post.Comments, err = GetCommentsByPostID(post.PostID)
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
	WHERE post_exposure = 'Public'
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
		post.Author, err = GetUserByID(post.AuthorID)
		if err != nil {
			return nil, err
		}

		post.Comments, err = GetCommentsByPostID(post.PostID)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func GetPostsByGroupID(groupID uuid.UUID,userID uuid.UUID) ([]PostModel, error) {
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
		post.Author, err = GetUserByID(post.AuthorID)
		post.IsLiked, _ = GetIsPostLiked(post.PostID,userID)
		if err != nil {
			return nil, err
		}

		post.Comments, err = GetCommentsByPostID(post.PostID)
 		if err != nil {
 			return nil, err
 		}
		posts = append(posts, post)
	}
	return posts, nil
}

// GetUsersNotInGroup retrieves all users not in the specified group.
func GetUsersNotInGroup(groupID uuid.UUID) ([]UserModel, error) {
    query := `
    SELECT u.user_id, u.user_fname, u.user_lname, u.user_email, u.user_avatar_path, u.user_nickname, u.user_about
    FROM user u
    LEFT JOIN group_user gu ON u.user_id = gu.user_id AND gu.group_id = ?
    WHERE gu.user_id IS NULL`

    rows, err := storage.DB.Query(query, groupID)
    if err != nil {
        log.Println("Error querying users not in group:", err)
        return nil, err
    }
    defer rows.Close()

    var users []UserModel
    for rows.Next() {
        var user UserModel
        if err := rows.Scan(&user.UserID, &user.UserFirstName, &user.UserLastName, &user.UserEmail, &user.UserAvatarPath, &user.UserNickname, &user.UserBio); err != nil {
            log.Println("Error scanning user not in group:", err)
            return nil, err
        }
        users = append(users, user)
    }

    return users, nil
}