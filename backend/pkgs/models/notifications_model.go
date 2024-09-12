package models

import (
	"bonfire/pkgs/utils"
	"time"

	"github.com/gofrs/uuid"
)

// NotificationModel represents the structure of the notification table
type NotificationModel struct {
	NotiID      uuid.UUID `json:"noti_id,omitempty"`
	ReceiverID  uuid.UUID `json:"receiver_id,omitempty"`
	NotiType    string    `json:"noti_type"`
	NotiContent string    `json:"noti_content"`
	NotiTime    time.Time `json:"noti_time"`
	NotiStatus  string    `json:"noti_status,omitempty"`
	UserID      uuid.UUID `json:"user_id,omitempty"`
	GroupID     uuid.UUID `json:"group_id,omitempty"`
	EventID     uuid.UUID `json:"event_id,omitempty"`
}

// CRUD Operations

// Function to create a notification
func (n *NotificationModel) Save() error {
	if n.NotiID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		n.NotiID = uid
	}

	columns := []string{"noti_id", "receiver_id", "noti_type", "noti_content", "noti_time", "user_id", "group_id", "event_id", "noti_status"}
	values := []interface{}{n.NotiID, n.ReceiverID, n.NotiType, n.NotiContent, n.NotiTime, n.UserID, n.GroupID, n.EventID, n.NotiStatus}
	_, err := utils.Create("notification", columns, values)
	return err
}

// Function to delete a notification
func (n *NotificationModel) Del() error {
	condition := "noti_id = ?"
	_, err := utils.Delete("notification", condition, n.NotiID)
	return err
}

// Function to update a notification
func (n *NotificationModel) Update() error {
	updates := map[string]interface{}{
		"receiver_id":  n.ReceiverID,
		"noti_type":    n.NotiType,
		"noti_content": n.NotiContent,
		"noti_time":    n.NotiTime,
		"noti_status":  n.NotiStatus,
	}
	condition := "noti_id = ?"
	_, err := utils.Update("notification", updates, condition, n.NotiID)
	return err
}

// Function to get notifications by receiver ID
func GetNotificationsByReceiverID(receiverID uuid.UUID) ([]NotificationModel, error) {
	columns := []string{"noti_id", "receiver_id", "noti_type", "noti_content", "noti_time", "user_id", "group_id", "event_id", "noti_status"}
	condition := "receiver_id = ?"
	rows, err := utils.Read("notification", columns, condition, receiverID)
	const layout = "2006-01-02 15:04:05.999999999-07:00"
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []NotificationModel
	for rows.Next() {
		var timeString string
		var notification NotificationModel
		err := rows.Scan(&notification.NotiID, &notification.ReceiverID, &notification.NotiType, &notification.NotiContent, &timeString, &notification.UserID, &notification.GroupID, &notification.EventID, &notification.NotiStatus)
		if err != nil {
			return nil, err
		}

		notification.NotiTime, err = time.Parse(layout, timeString)
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
	_, err := utils.Update("notification", updates, condition, receiverID, "unread")
	return err
}

// niche method to delete a noti by ID
func DeleteNotiByID(notiID string) error {
	var noti NotificationModel

	const layout = "2006-01-02 15:04:05.999999999-07:00"
	condition := "noti_id = ?"
	columns := []string{"noti_id", "receiver_id", "noti_type", "noti_content", "noti_time", "user_id", "group_id", "event_id", "noti_status"}

	rows, err := utils.Read("notification", columns, condition, notiID)
	if err != nil {
		return err
	}

	for rows.Next() {
		var timeString string
		err := rows.Scan(&noti.NotiID, &noti.ReceiverID, &noti.NotiType, &noti.NotiContent, &timeString, &noti.UserID, &noti.GroupID, &noti.EventID, &noti.NotiStatus)
		if err != nil {
			return err
		}

		noti.NotiTime, err = time.Parse(layout, timeString)
		if err != nil {
			return err
		}
	}

	if err := noti.Del(); err != nil {
		return err
	}

	return nil
}
