package models

import (
	"time"

	"github.com/gofrs/uuid"

	"bonfire/pkgs/utils"
)

type PrivateMessage struct {
	MessageID      uuid.UUID `json:"message_id"`
	SenderID       uuid.UUID `json:"sender_id"`
	RecipientID    uuid.UUID `json:"recipient_id"`
	MessageContent string    `json:"message_content"`
	MessageTime    time.Time `json:"message_timestamp"`
}

func (pm *PrivateMessage) Save() error {
	if pm.MessageID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		pm.MessageID = uid
	}

	if pm.MessageTime.IsZero() {
		pm.MessageTime = time.Now()
	}

	columns := []string{"message_id", "sender_id", "recipient_id", "message_content", "message_timestamp"}
	values := []interface{}{pm.MessageID, pm.SenderID, pm.RecipientID, pm.MessageContent, pm.MessageTime}

	_, err := utils.Create("private_message", columns, values)
	return err
}

func (pm *PrivateMessage) Del() error {
	condition := "message_id = ?"
	_, err := utils.Delete("private_message", condition, pm.MessageID)
	return err
}

func (pm *PrivateMessage) Update() error {
	updates := map[string]interface{}{
		"message_id":        pm.MessageID,
		"sender_id":         pm.SenderID,
		"recipient_id":      pm.RecipientID,
		"message_content":   pm.MessageContent,
		"message_timestamp": pm.MessageTime,
	}
	condition := "message_id = ?"
	_, err := utils.Update("private_message", updates, condition, pm.MessageID)
	return err
}

func GetMessageBySender(messageID string) (*PrivateMessage, error) {
	columns := []string{"message_id", "sender_id", "recipient_id", "message_content", "message_timestamp"}
	condition := "message_id = ?"
	rows, err := utils.Read("private_message", columns, condition, messageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var privateMesage PrivateMessage
	if rows.Next() {
		err := rows.Scan(&privateMesage.MessageID, &privateMesage.SenderID, &privateMesage.RecipientID, &privateMesage.MessageContent, &privateMesage.MessageTime)
		if err != nil {
			return nil, err
		}
	}

	return &privateMesage, nil
}

func LoadChatHistory(user1, user2 string) ([]PrivateMessage, error) {
	condition := "sender_id = ? AND recipient_id = ? OR sender_id = ? AND recipient_id = ?"
	rows, err := utils.Read("private_message", []string{"message_id", "sender_id", "recipient_id", "message_content", "message_timestamp"}, condition, user1, user2, user2, user1)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rowCount := 0
	for rows.Next() {
		rowCount++
	}

	var messages []PrivateMessage
	for rows.Next() {
		var message PrivateMessage
		err := rows.Scan(&message.MessageID, &message.SenderID, &message.RecipientID, &message.MessageContent, &message.MessageTime)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	return messages, nil
}
