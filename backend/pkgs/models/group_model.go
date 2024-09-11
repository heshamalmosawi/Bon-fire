package models

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/storage"
	"bonfire/pkgs/utils"
)

type GroupModel struct {
	GroupID      uuid.UUID  `json:"group_id"`
	OwnerID      uuid.UUID  `json:"owner_id"`
	GroupName    string     `json:"group_name"`
	GroupDescrip string     `json:"group_desc"`
	Owner        *UserModel `json:"owner"`
}

// makes it easier to fetch
type ExtendedGroupModel struct {
	GroupID      uuid.UUID  `json:"group_id"`
	OwnerID      uuid.UUID  `json:"owner_id"`
	GroupName    string     `json:"group_name"`
	GroupDescrip string     `json:"group_desc"`
	IsMember     bool       `json:"is_member"`
	TotalMembers int        `json:"total_members"`
	IsRequested  bool       `json:"is_requested"`
	Owner        *UserModel `json:"owner"`
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

// fix this later
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
		group.Owner, _ = GetUserByID(group.OwnerID)
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
		group.Owner, _ = GetUserByID(group.OwnerID)
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
	group.Owner, _ = GetUserByID(group.OwnerID)

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

	group.Owner, _ = GetUserByID(group.OwnerID)
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
	group.Owner, _ = GetUserByID(group.OwnerID)
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

// Function to add a user to a group
func AddUserToGroup(group *GroupModel, user *UserModel) error {
	// Check if the user is already a member of the group
	isMember, err := IsUserMemberOfGroup(user.UserID, group.GroupID)
	if err != nil {
		return fmt.Errorf("failed to check if user is a member of the group: %v", err)
	}

	if isMember {
		log.Printf("User %s is already a member of group %s", user.UserID, group.GroupID)
		return fmt.Errorf("user is already a member of the group")
	}

	// If the user is not a member, proceed to add the user to the group
	columns := []string{"group_id", "user_id"}
	values := []interface{}{group.GroupID, user.UserID}

	_, err = utils.Create("group_user", columns, values)
	if err != nil {
		return fmt.Errorf("failed to add user to group: %v", err)
	}

	log.Printf("User %s successfully added to group %s", user.UserID, group.GroupID)
	return nil
}

// Check if a user is already a member of the group
func IsUserMemberOfGroup(userID uuid.UUID, groupID uuid.UUID) (bool, error) {
	var exists bool
	query := `SELECT EXISTS (SELECT 1 FROM group_user WHERE user_id = $1 AND group_id = $2)`

	err := storage.DB.QueryRow(query, userID, groupID).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		log.Println("Error checking if user is a member of the group:", err)
		return false, err
	}

	return exists, nil
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
		group.IsMember = inGroup

		// Check if there are any pending requests by this user for this group
		pendingRequests, err := GetPendingRequestsByGroupID(group.GroupID)
		if err != nil {
			return nil, err
		}
		group.IsRequested = false
		for _, request := range pendingRequests {
			if request.UserID == userID && request.InteractionType && request.Status == "pending" {
				group.IsRequested = true
				break
			}
		}

		// Get the total number of members in this group
		totalMembers, err := GetTotalMembers(group.GroupID)
		if err != nil {
			return nil, err
		}
		group.TotalMembers = totalMembers + 1

		group.Owner, _ = GetUserByID(group.OwnerID)
		groupResponses = append(groupResponses, group)
	}

	return groupResponses, nil
}

func GetGroupMembers(groupID uuid.UUID) ([]UserModel, error) {
    var users []UserModel

    // Ensure the groupID is a valid UUID before querying
    

    columns := []string{"user_id"}
    condition := "group_id = ?"
    
    // Utilizing a helper function to perform the SQL read operation
    rows, err := utils.Read("group_user", columns, condition, groupID) // Pass parsedGroupID directly
    if err != nil {
        log.Printf("Failed to read from group_user table: %v", err)
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var userid string
        if err := rows.Scan(&userid); err != nil {
            log.Printf("Failed to scan userID: %v", err)
            return nil, err
        }

        parsedUserId, err := uuid.FromString(userid)
        if err != nil {
            log.Printf("Invalid UUID format for userID: %v", err)
            return nil, err
        }

        user, err := GetUserByID(parsedUserId)
        if err != nil {
            log.Printf("Failed to get user by ID: %v", err)
            return nil, err
        }

        users = append(users, *user)
    }

    if err = rows.Err(); err != nil {
        log.Printf("Error occurred during rows iteration: %v", err)
        return nil, err
    }

    return users, nil
}


// GetGroupsOwnedByUser retrieves all groups owned by a specific user using the utils package for database interaction.
func GetGroupsOwnedByUser(userID uuid.UUID) ([]GroupModel, error) {
    columns := []string{"group_id", "owner_id", "group_name", "group_desc"}
    condition := "owner_id = ?"

    // Using utils.Read to execute the query
    rows, err := utils.Read("`group`", columns, condition, userID)
    if err != nil {
        log.Printf("Error executing query in GetGroupsOwnedByUser: %v", err)
        return nil, err
    }
    defer rows.Close()

    var groups []GroupModel

    // Iterate through the result set and populate the groups slice
    for rows.Next() {
        var group GroupModel
        err := rows.Scan(&group.GroupID, &group.OwnerID, &group.GroupName, &group.GroupDescrip)
        if err != nil {
            log.Printf("Error scanning row in GetGroupsOwnedByUser: %v", err)
            return nil, err
        }

        // Optionally, fetch the owner user model if necessary
        group.Owner, _ = GetUserByID(group.OwnerID)

        groups = append(groups, group)
    }

    if err := rows.Err(); err != nil {
        log.Printf("Error with rows iteration in GetGroupsOwnedByUser: %v", err)
        return nil, err
    }

    return groups, nil
}
