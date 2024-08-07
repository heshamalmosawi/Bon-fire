package models

import (
	"bonfire/pkgs/utils"
	"time"

	"github.com/gofrs/uuid"
)

type PrivateMessage struct {
	MessageID      uuid.UUID `json:"message_id"`
	SenderID      uuid.UUID `json:"sender_id"`
	RecipientID    uuid.UUID `json:"recipient_id"`
	MessageContent string `json:"message_content"`
	MessageTime time.Time `json:"message_timestamp"`
}

func (pm *PrivateMessage) Save() error {
	if pm.MessageID == uuid.Nil {
		uid, err := uuid.NewV4()
		if err != nil {
			return err
		}
		pm.MessageID = uid
	}

	columns := []string{"message_id","sender_id","recipient_id", "message_content", "message_timestamp"}
	values := []interface{}{pm.MessageID, pm.SenderID, pm.RecipientID, pm.MessageContent, pm.MessageTime}

	_, err := utils.Create("message", columns, values)
	return err
}

func (pm *PrivateMessage) Del() error {
	condition := "message_id = ?"
	_, err := utils.Delete("message", condition, pm.MessageID)
	return err
}

func (pm *PrivateMessage) Update() error {
	updates := map[string]interface{}{
		"message_id" : pm.MessageID,
		"sender_id" : pm.SenderID,
		"recipient_id" : pm.RecipientID,
		"message_content" : pm.MessageContent, 
		"message_timestamp" : pm.MessageTime,
	
	}
	condition := "message_id = ?"
	_, err := utils.Update("message", updates, condition, pm.MessageID)
	return err
}

func GetMessageBySender(messageID string) (*PrivateMessage, error) {
	columns := []string{"message_id","sender_id","recipient_id", "message_content", "message_timestamp"}
	condition := "message_id = ?"
	rows, err := utils.Read("message", columns, condition, messageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var privateMesage PrivateMessage
	if rows.Next() {
		err := rows.Scan(&privateMesage.MessageID, &privateMesage.SenderID, &privateMesage.RecipientID,  &privateMesage.MessageContent,  &privateMesage.MessageTime)
		if err != nil {
			return nil, err
		}
	}

	return &privateMesage, nil
}
