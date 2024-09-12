package notify

import (
	"bonfire/pkgs/models"
	"bonfire/pkgs/utils"
	"errors"
	"log"
	"sort"

	"github.com/gofrs/uuid"
)

func NotifyUser(userID uuid.UUID, notification models.NotificationModel) error {
	user, err := models.GetUserByID(userID)
	if err != nil {
		return err
	}

	sub, err := SubscriptionByUser(user)
	if err != nil || sub == nil {
		return utils.ErrUserNotOnline
	}

	return sub.Conn.WriteJSON(notification)
}

func BrodcastNotiToGroup(groupID uuid.UUID, notification models.NotificationModel) error {
	users, err := models.GetGroupMembers(groupID)
	if err != nil {
		return err
	}

	for _, user := range users {
		if err := NotifyUser(user.UserID, models.NotificationModel{
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

func SendAllNotis(sub Subscriber) error {
	userID := sub.Session.User.UserID

	userNotis, err := models.GetNotificationsByReceiverID(userID)
	if err != nil {
		log.Printf("error getting previous notis %v", err)
		return err
	}

	sort.SliceStable(userNotis, func(i, j int) bool {
		if userNotis[i].NotiStatus != userNotis[j].NotiStatus {
			return userNotis[i].NotiStatus == "unread"
		}

		return userNotis[i].NotiTime.Before(userNotis[j].NotiTime)
	})

	if err := sub.Conn.WriteJSON(userNotis); err != nil {
		log.Printf("error getting previous notis %v", err)
		return err
	}

	return nil
}
