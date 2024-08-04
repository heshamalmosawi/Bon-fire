package models

import (
	"bonfire/pkgs/utils"
	"github.com/gofrs/uuid"
)

// UserNotificationModel represents the structure of the user_notification table
type UserNotificationModel struct {
	NotiID      uuid.UUID `json:"noti_id"`
	ReceiverID  uuid.UUID `json:"receiver_id"`
	NotiType    string    `json:"noti_type"`
	NotiContent string    `json:"noti_content"`
	NotiTime    string    `json:"noti_time"`
	NotiStatus  string    `json:"noti_status"`
}

// CRUD Operations

// Function to create a notification
func (n *UserNotificationModel) Save() error {
	if n.NotiID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		n.NotiID = uid
	}

	columns := []string{"noti_id", "receiver_id", "noti_type", "noti_content", "noti_time", "noti_status"}
	values := []interface{}{n.NotiID, n.ReceiverID, n.NotiType, n.NotiContent, n.NotiTime, n.NotiStatus}
	_, err := utils.Create("user_notification", columns, values)
	return err
}

// Function to delete a notification
func (n *UserNotificationModel) Del() error {
	condition := "noti_id = ?"
	_, err := utils.Delete("user_notification", condition, n.NotiID)
	return err
}

// Function to update a notification
func (n *UserNotificationModel) Update() error {
	updates := map[string]interface{}{
		"receiver_id":  n.ReceiverID,
		"noti_type":    n.NotiType,
		"noti_content": n.NotiContent,
		"noti_time":    n.NotiTime,
		"noti_status":  n.NotiStatus,
	}
	condition := "noti_id = ?"
	_, err := utils.Update("user_notification", updates, condition, n.NotiID)
	return err
}

// Function to get notifications by receiver ID
func GetNotificationsByReceiverID(receiverID uuid.UUID) ([]UserNotificationModel, error) {
	columns := []string{"noti_id", "receiver_id", "noti_type", "noti_content", "noti_time", "noti_status"}
	condition := "receiver_id = ?"
	rows, err := utils.Read("user_notification", columns, condition, receiverID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []UserNotificationModel
	for rows.Next() {
		var notification UserNotificationModel
		err := rows.Scan(&notification.NotiID, &notification.ReceiverID, &notification.NotiType, &notification.NotiContent, &notification.NotiTime, &notification.NotiStatus)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	return notifications, nil
}

// Function to mark all notifications as read for a specific receiver
func MarkAllNotificationsAsRead(receiverID uuid.UUID) error {
	updates := map[string]interface{}{
		"noti_status": "read",
	}
	condition := "receiver_id = ? AND noti_status = ?"
	_, err := utils.Update("user_notification", updates, condition, receiverID, "unread")
	return err
}