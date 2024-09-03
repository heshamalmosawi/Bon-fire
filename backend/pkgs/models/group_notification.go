package models

import (
	"bonfire/pkgs/utils"
	"time"

	"github.com/gofrs/uuid"
)

type GroupNotification struct {
	NotificationID      uuid.UUID `json:"noti_id"`
	GroupID             uuid.UUID `json:"group_id"`
	NotifiactionType    string    `json:"noti_type"`
	NotificationContent string    `json:"noti_content"`
	NotificationTime    time.Time `json:"noti_time"`
	NotificationStatus  string    `json:"noti_status"`
}

func (gn *GroupNotification) Save() error {
	if gn.NotificationID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		gn.NotificationID = uid
	}

	columns := []string{"noti_id", "group_id", "noti_type", "noti_content", "noti_time", "noti_status"}
	values := []interface{}{gn.NotificationID, gn.GroupID, gn.NotifiactionType, gn.NotificationContent, gn.NotificationTime, gn.NotificationStatus}

	_, err := utils.Create("group_notification", columns, values)
	return err
}

func (gn *GroupNotification) Del() error {
	condition := "noti_id = ?"
	_, err := utils.Delete("group_notification", condition, gn.NotificationID)
	return err
}

func (gn *GroupNotification) Update() error {
	updates := map[string]interface{}{
		"noti_id":      gn.NotificationID,
		"group_id":     gn.GroupID,
		"noti_type":    gn.NotifiactionType,
		"noti_content": gn.NotificationContent,
		"noti_time":    gn.NotificationTime,
		"noti_status":  gn.NotificationStatus,
	}
	condition := "noti_id = ?"
	_, err := utils.Update("group_notification", updates, condition, gn.NotificationID)
	return err
}

func GetNotificationByGroup(notificationID string) (*GroupNotification, error) {
	columns := []string{"noti_id", "group_id", "noti_type", "noti_content", "noti_time", "noti_status"}
	condition := " noti_id = ?"
	rows, err := utils.Read("group_notification", columns, condition, notificationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notificataions GroupNotification
	if rows.Next() {
		err := rows.Scan(&notificataions.NotificationID, &notificataions.GroupID, &notificataions.NotificationContent, &notificataions.NotificationTime, &notificataions.NotificationStatus)
		if err != nil {
			return nil, err
		}
	}

	return &notificataions, nil
}
