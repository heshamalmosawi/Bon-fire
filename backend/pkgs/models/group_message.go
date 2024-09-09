package models

import (
	"bonfire/pkgs/utils"
	"time"

	"github.com/gofrs/uuid"
)

type GroupMessage struct {
	MessageID      uuid.UUID `json:"message_id"`
	SenderID       uuid.UUID `json:"sender_id"`
	GroupID        uuid.UUID `json:"group_id"`
	MessageContent string    `json:"message_content"`
	MessageTime    time.Time `json:"message_timestamp"`
}

func (gm *GroupMessage) Save() error {
	if gm.MessageID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		gm.MessageID = uid
	}

	columns := []string{"message_id", "sender_id", "group_id", "message_content", "message_timestamp"}
	values := []interface{}{gm.MessageID, gm.SenderID, gm.GroupID, gm.MessageContent, gm.MessageTime}

	_, err := utils.Create("group_message", columns, values)
	return err
}

func (gm *GroupMessage) Del() error {
	condition := "message_id = ?"
	_, err := utils.Delete("group_message", condition, gm.MessageID)
	return err
}

func (pm *GroupMessage) Update() error {
	updates := map[string]interface{}{
		"message_id":        pm.MessageID,
		"sender_id":         pm.SenderID,
		"group_id":          pm.GroupID,
		"message_content":   pm.MessageContent,
		"message_timestamp": pm.MessageTime,
	}
	condition := "message_id = ?"
	_, err := utils.Update("group_message", updates, condition, pm.MessageID)
	return err
}

func GetMessageBySenderOfGroup(messageID string) (*GroupMessage, error) {
	columns := []string{"message_id", "sender_id", "group_id", "message_content", "message_timestamp"}
	condition := "message_id = ?"
	rows, err := utils.Read("group_message", columns, condition, messageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groupMessage GroupMessage
	if rows.Next() {
		err := rows.Scan(&groupMessage.MessageID, &groupMessage.SenderID, &groupMessage.GroupID, &groupMessage.MessageContent, &groupMessage.MessageTime)
		if err != nil {
			return nil, err
		}
	}

	return &groupMessage, nil
}

// GetMessagesByGroupID returns a list of messages for a given group ID.
func GetMessagesByGroupID(groupID string) ([]GroupMessage, error) {
	columns := []string{"message_id", "sender_id", "group_id", "message_content", "message_timestamp"}
	condition := "group_id = ?"
	rows, err := utils.Read("group_message", columns, condition, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groupMessages []GroupMessage
	for rows.Next() {
		var groupMessage GroupMessage
		err := rows.Scan(&groupMessage.MessageID, &groupMessage.SenderID, &groupMessage.GroupID, &groupMessage.MessageContent, &groupMessage.MessageTime)
		if err != nil {
			return nil, err
		}
		groupMessages = append(groupMessages, groupMessage)
	}

	return groupMessages, nil
}
