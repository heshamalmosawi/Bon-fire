package models

import (
	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"
	"fmt"
	"log"

	"github.com/gofrs/uuid"
)

type GroupUser struct {
	MemberID uuid.UUID `json:"member_id"`
	UserID   uuid.UUID `json:"user_id"`
	GroupID  uuid.UUID `json:"group_id"`
}

func (gu *GroupUser) Save() error {
	if gu.MemberID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		gu.MemberID = uid
	}

	columns := []string{"member_id", "user_id", "group_id"}
	values := []interface{}{gu.MemberID, gu.UserID, gu.GroupID}

	_, err := utils.Create("group_user", columns, values)
	return err
}

func (gu *GroupUser) Del() error {
	condition := "member_id = ?"
	_, err := utils.Delete("group_user", condition, gu.MemberID)
	return err
}

func (gu *GroupUser) Update() error {
	updates := map[string]interface{}{
		"member_id": gu.MemberID,
		"user_id":   gu.UserID,
		"group_id":  gu.GroupID,
	}
	condition := "attendance_id = ?"
	_, err := utils.Update("group_user", updates, condition, gu.MemberID)
	return err
}

func GetMemberUserByGroup(memberID string) (*GroupUser, error) {
	columns := []string{"member_id", "user_id", "group_id"}
	condition := "member_id = ?"
	rows, err := utils.Read("group_user", columns, condition, memberID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groupUser GroupUser
	if rows.Next() {
		err := rows.Scan(&groupUser.MemberID, &groupUser.UserID, &groupUser.GroupID)
		if err != nil {
			return nil, err
		}
	}

	return &groupUser, nil
}

// DeleteUserFromGroup removes a user from a group by deleting the record from the group_user table
func DeleteUserFromGroup(userID, groupID uuid.UUID) error {
	condition := "user_id = ? AND group_id = ?"
	_, err := utils.Delete("group_user", condition, userID, groupID)
	return err
}

func IsUserInGroup(userID, groupID uuid.UUID) (bool, error) {
	fmt.Println("we here checking?")
	columns := []string{"member_id"}
	condition := "user_id = ? AND group_id = ?"
	rows, err := utils.Read("group_user", columns, condition, userID, groupID)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	// If there is at least one row, the user is in the group
	if rows.Next() {
		fmt.Println("we here its true?")
		return true, nil
	}

	return false, nil
}

func GetTotalMembers(groupID uuid.UUID) (int, error) {
	// Prepare the query to count members
	query := "SELECT COUNT(*) FROM group_user WHERE group_id = ?"

	// Execute the query
	var totalMembers int
	err := storage.DB.QueryRow(query, groupID).Scan(&totalMembers)
	if err != nil {
		return 0, err
	}

	return totalMembers, nil
}

// GetMembersByGroupID retrieves all members of a specific group based on the group ID.
func GetMembersByGroupID(groupID uuid.UUID) ([]UserModel, error) {
	// Define the query to get the user details of all members in the group
	query := `
	SELECT u.user_id, u.user_fname, u.user_lname, u.user_email, u.user_avatar_path, u.user_nickname, u.user_about
	FROM user u
	INNER JOIN group_user gu ON u.user_id = gu.user_id
	WHERE gu.group_id = ?`

	// Execute the query
	rows, err := storage.DB.Query(query, groupID)
	if err != nil {
		log.Println("Error executing query in GetMembersByGroupID:", err)
		return nil, err
	}
	defer rows.Close()

	// Prepare a slice to hold the user details of the group members
	var members []UserModel

	// Iterate through the result set and populate the slice
	for rows.Next() {
		var user UserModel
		err := rows.Scan(
			&user.UserID,
			&user.UserFirstName,
			&user.UserLastName,
			&user.UserEmail,
			&user.UserAvatarPath,
			&user.UserNickname,
			&user.UserBio,
		)
		if err != nil {
			log.Println("Error scanning row in GetMembersByGroupID:", err)
			return nil, err
		}
		members = append(members, user)
	}

	// Return the slice of members
	return members, nil
}

// GetGroupsByUser retrieves all groups that a user with the given userID is a part of.
func GetGroupsByUser(userID uuid.UUID) ([]*GroupUser, error) {
	// Define the query to get all group memberships for a given user
	columns := []string{"member_id", "user_id", "group_id"}
	condition := "user_id = ?"

	// Execute the query
	rows, err := utils.Read("group_user", columns, condition, userID)
	if err != nil {
		log.Println("Error executing query in GetGroupsByUser:", err)
		return nil, err
	}
	defer rows.Close()

	// Prepare a slice to hold the group membership details
	var groupUsers []*GroupUser

	// Iterate through the result set and populate the slice
	for rows.Next() {
		var groupUser GroupUser
		err := rows.Scan(&groupUser.MemberID, &groupUser.UserID, &groupUser.GroupID)
		if err != nil {
			log.Println("Error scanning row in GetGroupsByUser:", err)
			return nil, err
		}
		groupUsers = append(groupUsers, &groupUser)
	}

	// Return the slice of GroupUser records
	return groupUsers, nil
}

