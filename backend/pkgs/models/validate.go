package models

import (
	"bonfire/pkgs/storage"
	"errors"
	"fmt"

	"github.com/gofrs/uuid"
)

var ErrNotFound = errors.New("resource not found")
// ValidateAndGetGroup validates the group ID and fetches the group if it exists.
func ValidateAndGetGroup(groupIDStr string) (*GroupModel, error) {
	groupID, err := uuid.FromString(groupIDStr)
	if err != nil {
		return nil, err
	}

	group, err := GetGroupByID(groupID)
	if err != nil {
		return nil, err
	}
	if group == nil {
		return nil, ErrNotFound // Assume ErrNotFound is defined to indicate no result was found.
	}

	return group, nil
}

func ValidateUserID(userIDStr string) (uuid.UUID, error) {
	userID, err := uuid.FromString(userIDStr)
	if err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}

func ValidateUUID(uuidStr, tableName, columnName string) (uuid.UUID, error) {
	// Convert the string to a UUID.
	uid, err := uuid.FromString(uuidStr)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid UUID format: %v", err)
	}

	// Check if the UUID exists in the database.
	query := fmt.Sprintf("SELECT EXISTS (SELECT 1 FROM %s WHERE %s = ?)", tableName, columnName)
	var exists bool
	err = storage.DB.QueryRow(query, uid).Scan(&exists)
	if err != nil {
		return uuid.Nil, fmt.Errorf("error checking UUID existence: %v", err)
	}
	if !exists {
		return uuid.Nil, fmt.Errorf("UUID does not exist in %s", tableName)
	}

	return uid, nil
}