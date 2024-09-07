package notify

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"errors"

	"github.com/gofrs/uuid"
)

func NotifyUser(userID uuid.UUID, notification models.UserNotificationModel) error {
	user, err := models.GetUserByID(userID)
	if err != nil {
		return err
	}

	conn := SubscriptionByUser(user)
	if conn == nil {
		return utils.ErrUserNotOnline
	}

	return conn.WriteJSON(notification)
}

func BrodcastNotiToGroup(groupID uuid.UUID, notification models.GroupNotificationModel) error {
	users, err := models.GetGroupMembers(groupID.String())
	if err != nil {
		return err
	}

	for _, user := range users {
		if err := NotifyUser(user.UserID, models.UserNotificationModel{
			NotiID:      notification.NotiID,
			NotiType:    notification.NotiType,
			NotiContent: notification.NotiContent,
			NotiTime:    notification.NotiTime,
		}); err != nil {
			if errors.Is(err, utils.ErrUserNotOnline) {
				continue
			} else {
				return err
			}
		}
	}

	return nil
}
