package utils

import "errors"

var (
	ErrUserNotOnline = errors.New("notification recipient is not online")
	ErrUserNotFound = errors.New("user not found in DB")
)
