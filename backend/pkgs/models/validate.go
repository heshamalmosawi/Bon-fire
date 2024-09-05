package models

import (
	"github.com/gofrs/uuid"
	 "errors"
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