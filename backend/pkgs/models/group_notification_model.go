package models

import (
	"bonfire/pkgs/utils"
	"time"

	"github.com/gofrs/uuid"
)

// UserNotificationModel represents the structure of the user_notification table
type GroupNotificationModel struct {
	NotiID      uuid.UUID `json:"noti_id"`
	GroupID  uuid.UUID `json:"group_id"`
	NotiType    string    `json:"noti_type"`
	NotiContent string    `json:"noti_content"`
	NotiTime    time.Time    `json:"noti_time"`
	NotiStatus  string    `json:"noti_status"`
}

// CRUD Operations

// Function to create a notification
func (n *GroupNotificationModel) Save() error {
	if n.NotiID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		n.NotiID = uid
	}

	columns := []string{"noti_id", "group_id", "noti_type", "noti_content", "noti_time", "noti_status"}
	values := []interface{}{n.NotiID, n.GroupID, n.NotiType, n.NotiContent, n.NotiTime, n.NotiStatus}
	_, err := utils.Create("group_notification", columns, values)
	return err
}

// Function to delete a notification
func (n *GroupNotificationModel) Del() error {
	condition := "noti_id = ?"
	_, err := utils.Delete("group_notification", condition, n.NotiID)
	return err
}

// Function to update a notification
func (n *GroupNotificationModel) Update() error {
	updates := map[string]interface{}{
		"group_id":  n.GroupID,
		"noti_type":    n.NotiType,
		"noti_content": n.NotiContent,
		"noti_time":    n.NotiTime,
		"noti_status":  n.NotiStatus,
	}
	condition := "noti_id = ?"
	_, err := utils.Update("group_notification", updates, condition, n.NotiID)
	return err
}

// Function to get notifications by receiver ID
func GetNotificationsByGroupID(groupID uuid.UUID) ([]GroupNotificationModel, error) {
	columns := []string{"noti_id", "group_id", "noti_type", "noti_content", "noti_time", "noti_status"}
	condition := "group_id = ?"
	rows, err := utils.Read("group_notification", columns, condition, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groupNotifications []GroupNotificationModel
	for rows.Next() {
		var groupNotification GroupNotificationModel
		err := rows.Scan(&groupNotification.NotiID, &groupNotification.GroupID, &groupNotification.NotiType, &groupNotification.NotiContent, &groupNotification.NotiTime, &groupNotification.NotiStatus)
		if err != nil {
			return nil, err
		}
		groupNotifications = append(groupNotifications, groupNotification)
	}

	return groupNotifications, nil
}

// Function to mark all notifications as read for a specific receiver
func MarkAllGroupNotificationsAsRead(groupID uuid.UUID) error {
	updates := map[string]interface{}{
		"noti_status": "read",
	}
	condition := "group_id = ? AND noti_status = ?"
	_, err := utils.Update("user_notification", updates, condition, groupID, "unread")
	return err
}