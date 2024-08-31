package models

import (
	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"

	"github.com/gofrs/uuid"
)

type GroupUser struct {
	MemberID      uuid.UUID `json:"member_id"`
	UserID      uuid.UUID `json:"user_id"`
	GroupID    uuid.UUID `json:"group_id"`
}

func (gu *GroupUser) Save() error {
	if gu.MemberID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		gu.MemberID = uid
	}

	columns := []string{"member_id","user_id","group_id"}
	values := []interface{}{gu.MemberID,gu.UserID,gu.GroupID}

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
		"member_id" : gu.MemberID,
		"user_id" : gu.UserID,
		"group_id" : gu.GroupID,
	
	}
	condition := "attendance_id = ?"
	_, err := utils.Update("group_user", updates, condition, gu.MemberID)
	return err
}

func GetMemberUserByGroup(memberID string) (*GroupUser, error) {
	columns := []string{"member_id","user_id","group_id"}
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
	columns := []string{"member_id"}
	condition := "user_id = ? AND group_id = ?"
	rows, err := utils.Read("group_user", columns, condition, userID, groupID)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	// If there is at least one row, the user is in the group
	if rows.Next() {
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
