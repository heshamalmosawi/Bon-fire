package models

import (
	"time"

	"github.com/gofrs/uuid"
)

type UserModel struct {
	UserID         uuid.UUID `json:"user_id"`
	UserEmail      string    `json:"user_email"`
	UserPassword   string    `json:"user_password"`
	UserFirstName  string    `json:"user_fname"`
	UserLastName   string    `json:"user_lname"`
	UserDOB        time.Time `json:"user_dob"`
	UserAvatarPath string    `json:"user_avatar_path"`
	UserNickname   string    `json:"user_nickname"`
	UserBio        string    `json:"user_bio"`
}
