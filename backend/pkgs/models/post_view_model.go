package models

import (
	"bonfire/pkgs/utils"
	"github.com/gofrs/uuid"
)

// PostViewModel represents the structure of the post_view table
type PostViewModel struct {
	ListingID uuid.UUID `json:"listing_id"`
	UserID    uuid.UUID `json:"user_id"`
	PostID    uuid.UUID `json:"post_id"`
}

// CRUD Operations

// Function to create a post view
func (pv *PostViewModel) Save() error {
	if pv.ListingID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		pv.ListingID = uid
	}

	columns := []string{"listing_id", "user_id", "post_id"}
	values := []interface{}{pv.ListingID, pv.UserID, pv.PostID}
	_, err := utils.Create("post_view", columns, values)
	return err
}

// Function to delete a post view
func (pv *PostViewModel) Del() error {
	condition := "listing_id = ?"
	_, err := utils.Delete("post_view", condition, pv.ListingID)
	return err
}

//For custom views we can just loop through users and saves them
func CreatePostViewsForUsers(postID uuid.UUID, userIDs []uuid.UUID) error {
	for _, userID := range userIDs {
		newView := PostViewModel{
			PostID: postID,
			UserID: userID,
		}
		if err := newView.Save(); err != nil {
			return err
		}
	}
	return nil
}

// Function to check if a user can view a post
func CanUserViewPost(userID, postID uuid.UUID) (bool, error) {
	columns := []string{"listing_id"}
	condition := "post_id = ? AND user_id = ?"
	rows, err := utils.Read("post_view", columns, condition, postID, userID)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	if rows.Next() {
		return true, nil
	}

	return false, nil
}