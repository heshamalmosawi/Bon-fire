package models

import (
	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"
	"log"

	"github.com/gofrs/uuid"
)

type GroupModel struct {
	GroupID      uuid.UUID `json:"group_id"`
	OwnerID    uuid.UUID `json:"owner_id"`
	GroupName   string    `json:"group_name"`
	GroupDescrip string    `json:"group_desc"`
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
		"group_id" : g.GroupID,
		"owner_id" : g.OwnerID,
		"group_name" : g.GroupName,
		"group_desc" : g.GroupDescrip,
	}
	condition := "group_id = ?"
	_, err := utils.Update("group", updates, condition, g.GroupID)
	return err
}

func GetOwwnerByGroup(ownerID string) (*GroupModel, error) {
	columns := []string{"group_id","owner_id","group_name","group_desc"}
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

// GetGroupByID retrieves the group details by its ID
func GetGroupByID(groupID uuid.UUID) (*GroupModel, error) {
	columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
	condition := "group_id = ?"
	rows, err := utils.Read("group", columns, condition, groupID)
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