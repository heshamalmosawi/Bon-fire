package utils

import "errors"

var (
	ErrUserNotFound = errors.New("user not found in DB")
)
