package models

import (
	"fmt"
	"log"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"
)

type GroupModel struct {
	GroupID      uuid.UUID `json:"group_id"`
	OwnerID      uuid.UUID `json:"owner_id"`
	GroupName    string    `json:"group_name"`
	GroupDescrip string    `json:"group_desc"`
}

//makes it easier to fetch
type ExtendedGroupModel struct {
	GroupID      uuid.UUID `json:"group_id"`
	OwnerID      uuid.UUID `json:"owner_id"`
	GroupName    string    `json:"group_name"`
	GroupDescrip string    `json:"group_desc"`
	IsMember     bool      `json:"is_member"`      
	TotalMembers int       `json:"total_members"`  
	IsRequested  bool      `json:"is_requested"`
}

func (g *GroupModel) Save() error {
	if g.GroupID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		g.GroupID = uid
	}

	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	values := []interface{}{g.GroupID, g.OwnerID, g.GroupName, g.GroupDescrip}

	escapedTableName := "`group`"

	_, err := utils.Create(escapedTableName, columns, values)
	return err
}

func (g *GroupModel) Del() error {
	condition := "group_id = ?"
	_, err := utils.Delete("group", condition, g.GroupID)
	return err
}

func (g *GroupModel) Update() error {
	updates := map[string]interface{}{
		"group_id":   g.GroupID,
		"owner_id":   g.OwnerID,
		"group_name": g.GroupName,
		"group_desc": g.GroupDescrip,
	}
	condition := "group_id = ?"
	_, err := utils.Update("group", updates, condition, g.GroupID)
	return err
}

func GetOwwnerByGroup(ownerID string) (*GroupModel, error) {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	condition := " owner_id = ?"
	rows, err := utils.Read("group", columns, condition, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var group GroupModel
	if rows.Next() {
		err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
		if err != nil {
			return nil, err
		}
	}

	return &group, nil
}

func GetAllGroups() ([]GroupModel, error) {
	query := "SELECT group_id, owner_id, group_name, group_desc FROM `group`"

	// Execute the query
	rows, err := storage.DB.Query(query)
	if err != nil {
		log.Println("Error executing query:", err)
		return nil, err
	}
	defer rows.Close()

	var groups []GroupModel
	for rows.Next() {
		var group GroupModel
		err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
		if err != nil {
			log.Println("Error scanning row:", err)
			return nil, err
		}
		groups = append(groups, group)
	}

	if err = rows.Err(); err != nil {
		log.Println("Error with rows iteration:", err)
		return nil, err
	}

	return groups, nil
}

// GetGroupByID retrieves the group details by its ID
func GetGroupByID(groupID uuid.UUID) (*GroupModel, error) {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	condition := "group_id = ?"
	rows, err := utils.Read("`group`", columns, condition, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		var group GroupModel
		err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
		if err != nil {
			return nil, err
		}
		return &group, nil
	}

	return nil, nil
}

func GetGroupNameByGroup(groupName string) (*GroupModel, error) {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	condition := " group_name = ?"
	rows, err := utils.Read("group", columns, condition, groupName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var group GroupModel
	if rows.Next() {
		err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
		if err != nil {
			return nil, err
		}
	}

	return &group, nil
}

func GetGroupDescripByGroup(groupDescrip string) (*GroupModel, error) {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	condition := " group_desc = ?"
	rows, err := utils.Read("group", columns, condition, groupDescrip)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var group GroupModel
	if rows.Next() {
		err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
		if err != nil {
			return nil, err
		}
	}

	return &group, nil
}

func GetGroupEverything(groupID, ownerID, groupName, groupDesc string) (*GroupModel, error) {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	condition := "group_id = ? AND owner_id = ? AND group_name = ? AND group_desc = ?"
	rows, err := utils.Read("group", columns, condition, groupID, ownerID, groupName, groupDesc)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var group GroupModel
	if rows.Next() {
		err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
		if err != nil {
			return nil, err
		}
	}
	return &group, nil
}

// function to create group
func CreateGroup(group *GroupModel) error {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	values := []interface{}{group.GroupID, group.OwnerID, group.GroupName, group.GroupDescrip}

	_, err := utils.Create("`group`", columns, values)

	if err != nil {
		return fmt.Errorf("CreateGroup: failed to insert group: %v", err)
	}
	return nil
}

// function to delete the group
func DeleteGroup(group *GroupModel) error {
	// columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	// values := []interface{}{group.GroupID,group.OwnerID,group.GroupName,group.GroupDescrip}

	values := []interface{}{group.GroupID, group.OwnerID, group.GroupName, group.GroupDescrip}

	condition := "group_id = ? AND owner_id = ? AND group_name = ? AND group_desc = ?"

	_, err := utils.Delete("`group`", condition, values...)

	if err != nil {
		return fmt.Errorf("CreateGroup: failed to insert group: %v", err)
	}
	return nil
}

// function to add the user to the group
func AddUserToGroup(group *GroupModel, user *UserModel) error {

	columns := []string{"group_id", "user_id"}
	values := []interface{}{group.GroupID, user.UserID}

	_, err := utils.Create("group", columns, values)

	if err != nil {
		return fmt.Errorf("CreateGroup: failed to insert group: %v", err)
	}
	return nil
}


func GetGroupsExtended(userID uuid.UUID) ([]ExtendedGroupModel, error) {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	rows, err := utils.Read("`group`", columns, "")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groupResponses []ExtendedGroupModel
	for rows.Next() {
		var group ExtendedGroupModel
		err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
		if err != nil {
			return nil, err
		}

		// Check if the user is in this group
		inGroup, err := IsUserInGroup(userID, group.GroupID)
		if err != nil {
			return nil, err
		}

		// Set the IsMember field based on the user's membership status
		group.IsMember = inGroup

		// Get the total number of members in this group
		totalMembers, err := GetTotalMembers(group.GroupID)
		if err != nil {
			return nil, err
		}
		group.TotalMembers = totalMembers + 1

		groupResponses = append(groupResponses, group)
	}

	return groupResponses, nil
}
